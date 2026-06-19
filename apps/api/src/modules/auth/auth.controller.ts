import { Controller, Post, Body, Get, HttpCode, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ burst: { ttl: 60000, limit: 5 }, medium: { ttl: 3600000, limit: 20 } })
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto, @Req() req: FastifyRequest) {
    return this.authService.register(dto, req.ip);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ burst: { ttl: 60000, limit: 10 }, medium: { ttl: 900000, limit: 30 } })
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
    return this.authService.login(dto, req.ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(
    @Body() body: { refresh_token: string },
    @Req() req: FastifyRequest,
  ) {
    const payload = req['user'] as { sub: string; refreshToken: string } | undefined;
    if (payload) {
      return this.authService.refresh(payload.sub, payload.refreshToken, req.ip);
    }
    return this.authService.refresh(body.refresh_token, body.refresh_token, req.ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  logout(@CurrentUser() user: User, @Body() body: { refresh_token: string }) {
    return this.authService.logout(user.id, body.refresh_token);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@CurrentUser() user: User) {
    const { passwordHash, ...result } = user as User & { passwordHash?: string };
    return result;
  }
}
