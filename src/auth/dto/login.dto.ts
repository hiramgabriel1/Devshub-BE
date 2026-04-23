import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@nuvix.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6, maxLength: 72, example: 'superSecret123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}

