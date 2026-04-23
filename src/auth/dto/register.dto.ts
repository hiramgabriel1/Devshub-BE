import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@nuvix.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6, maxLength: 72, example: 'superSecret123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ minLength: 3, maxLength: 30, example: 'hiramdev' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @ApiProperty({ minLength: 2, maxLength: 80, example: 'Backend Engineer' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  puesto!: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Construyendo APIs con NestJS y Prisma.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['NestJS', 'Prisma', 'PostgreSQL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStacks?: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: {
      github: 'https://github.com/hiramdev',
      linkedin: 'https://linkedin.com/in/hiramdev',
    },
  })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}
