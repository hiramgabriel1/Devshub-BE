import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

/**
 * Tecnologías: en JSON array; en form-data a veces vendrá como string JSON o "a, b, c".
 */
function transformTechStack({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(t);
        if (Array.isArray(parsed)) {
          return parsed.map(String).map((s) => s.trim()).filter(Boolean);
        }
      } catch {
        return undefined;
      }
    }
    return t
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

/**
 * En multipart, socialLinks a veces viene como string JSON.
 */
function transformSocialLinks({ value }: { value: unknown }): Record<string, string> | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, string>;
  }
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, string>;
      }
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 80, example: 'Backend Engineer' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  position?: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Sobre mí' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'https://nuvix.dev' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^https?:\/\//i, { message: 'websiteUrl debe comenzar con http:// o https://' })
  websiteUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['NestJS', 'Prisma'] })
  @Transform(transformTechStack)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  /** Mismo dato que `techStack` (el registro usa `techStacks`); envía solo uno. */
  @ApiPropertyOptional({
    type: [String],
    example: ['NestJS', 'Prisma'],
  })
  @Transform(transformTechStack)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStacks?: string[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { github: 'https://github.com/hiramdev' },
  })
  @Transform(transformSocialLinks)
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional({ minLength: 3, maxLength: 30, example: 'hiramdev' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;
}
