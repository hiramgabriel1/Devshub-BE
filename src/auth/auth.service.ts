import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const email = dto.email.toLowerCase();
    const username = dto.username;

    const user = await this.prisma.$transaction(async (tx) => {
      const existingByEmail = await tx.user.findUnique({
        where: { email },
        select: { id: true, isVerified: true },
      });
      if (existingByEmail?.isVerified) {
        throw new ConflictException('Email already in use');
      }

      const existingByUsername = await tx.user.findUnique({
        where: { username },
        select: { id: true, isVerified: true },
      });
      if (existingByUsername?.isVerified) {
        throw new ConflictException('Username already in use');
      }

      const toDeleteIds = new Set<string>();
      if (existingByEmail?.id) toDeleteIds.add(existingByEmail.id);
      if (existingByUsername?.id) toDeleteIds.add(existingByUsername.id);

      const ids = [...toDeleteIds];
      if (ids.length > 0) {
        await tx.emailVerificationToken.deleteMany({
          where: { userId: { in: ids } },
        });
        await tx.user.deleteMany({
          where: { id: { in: ids }, isVerified: false },
        });
      }

      return tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          position: dto.puesto,
          description: dto.description,
          techStack: dto.techStacks ?? [],
          socialLinks: dto.socialLinks as Prisma.InputJsonValue | undefined,
        },
      });
    });

    const token = await this.generateVerificationToken(user.id);
    await this.mailService.sendVerificationEmail({
      email: user.email,
      username: user.username,
      token,
    });

    return {
      message: 'Account created. Please verify your email before logging in.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Account not verified. Please verify your email first.');
    }

    return this.buildAuthResponse(user);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const verification = await this.prisma.emailVerificationToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      await this.prisma.emailVerificationToken.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException('Verification token expired');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
      this.prisma.emailVerificationToken.delete({
        where: { id: verification.id },
      }),
    ]);

    return this.buildAuthResponse(verification.user);
  }

  private async generateVerificationToken(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.prisma.emailVerificationToken.upsert({
      where: { userId },
      create: {
        userId,
        token,
        expiresAt,
      },
      update: {
        token,
        expiresAt,
      },
    });

    return token;
  }

  private buildAuthResponse(user: User) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }
}

