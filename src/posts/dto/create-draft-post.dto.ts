import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

const emptyToUndef = ({ value }: { value: unknown }) =>
  value === '' || value === null || value === undefined ? undefined : value;

/** JSON array, o string JSON, o "a, b" (multipart / form). */
function transformStringList({ value }: { value: unknown }): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.startsWith('[')) {
      try {
        const p: unknown = JSON.parse(t);
        if (Array.isArray(p)) {
          return p.map(String).map((s) => s.trim()).filter(Boolean);
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

/** Borrador: todos los campos opcionales; `title` vacío se guarda como "". */
export class CreateDraftPostDto {
  @ApiPropertyOptional({ maxLength: 150, example: 'Borrador sin título' })
  @Transform(emptyToUndef)
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ maxLength: 3000 })
  @Transform(emptyToUndef)
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @Transform(transformStringList)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @ApiPropertyOptional({ example: 'https://nuvix.dev' })
  @Transform(emptyToUndef)
  @IsOptional()
  @IsString()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ type: [String] })
  @Transform(transformStringList)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
