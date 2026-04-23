import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ maxLength: 150, example: 'How I built my portfolio with NestJS' })
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    maxLength: 3000,
    example: 'A short write-up about architecture decisions and deployment.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['posts/123/cover.png'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @ApiPropertyOptional({ example: 'https://nuvix.dev' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ type: [String], example: ['nestjs', 'backend', 'typescript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;
}

