import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { SESSION_COOKIE } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sid, maxAge } = await this.auth.login(dto);
    res.cookie(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      path: '/',
      ...(maxAge ? { maxAge } : {}),
    });
    return user;
  }

  @Get('me')
  me(@Req() req: Request) {
    const sid = req.cookies?.[SESSION_COOKIE];
    if (!sid) {
      throw new UnauthorizedException();
    }
    return this.auth.me(sid);
  }
}
