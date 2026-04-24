import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  private getPublicAppBaseUrl(): string {
    const explicit = process.env.APP_URL?.trim();
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }
    const isDeployedProd =
      process.env.NODE_ENV === 'production' ||
      process.env.RAILWAY_ENVIRONMENT === 'production';
    return isDeployedProd ? 'https://www.devshub.dev' : 'http://localhost:3000';
  }

  async sendVerificationEmail(params: { email: string; username: string; token: string }) {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      throw new InternalServerErrorException('RESEND_FROM_EMAIL is not configured');
    }

    const appUrl = this.getPublicAppBaseUrl();
    const verifyUrl = `${appUrl}/auth/verify-email?token=${params.token}`;

    const result = await this.resend.emails.send({
      from,
      to: params.email,
      subject: 'Verifica tu cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hola ${params.username}, confirma tu cuenta</h2>
          <p>Haz clic en el siguiente enlace para validar tu correo:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Este enlace expira en 24 horas.</p>
        </div>
      `,
    });

    if (result.error) {
      throw new InternalServerErrorException(
        `Failed to send verification email: ${result.error.message}`,
      );
    }

    return result.data;
  }
}

