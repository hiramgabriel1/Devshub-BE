import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiConflictResponse({ description: 'Email or username already in use' })
  @ApiOkResponse({
    description: 'User registered successfully',
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: { id: 'clx...', email: 'user@nuvix.dev', username: 'hiramdev' },
      },
    },
  })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiOkResponse({
    description: 'User logged in successfully',
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: { id: 'clx...', email: 'user@nuvix.dev', username: 'hiramdev' },
      },
    },
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

