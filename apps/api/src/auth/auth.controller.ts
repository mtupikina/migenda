import { randomBytes, timingSafeEqual } from 'node:crypto';

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { env } from '../env';
import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from './auth.constants';
import { clearOAuthStateCookie, setOAuthStateCookie, setSessionCookie } from './auth.cookies';
import { AuthService } from './auth.service';
import { CompletePasswordResetDto } from './complete-password-reset.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import { buildAuthorizeUrl, fetchOAuthProfile, OAuthError } from './oauth';
import type { OAuthProvider } from './oauth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sid, maxAge } = await this.auth.register(dto);
    setSessionCookie(res, sid, maxAge);
    return user;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sid, maxAge } = await this.auth.login(dto);
    setSessionCookie(res, sid, maxAge);
    return user;
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.auth.requestPasswordReset(dto.email);
    return { ok: true };
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() dto: CompletePasswordResetDto) {
    await this.auth.completePasswordReset(dto.token, dto.password);
    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request) {
    const sid = req.cookies?.[SESSION_COOKIE];
    if (!sid) {
      throw new UnauthorizedException();
    }
    return this.auth.me(sid);
  }

  @Get('google')
  startGoogle(@Res() res: Response) {
    this.startOAuth('google', res);
  }

  @Get('github')
  startGithub(@Res() res: Response) {
    this.startOAuth('github', res);
  }

  @Get('google/callback')
  googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback('google', { code, state, error }, req, res);
  }

  @Get('github/callback')
  githubCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback('github', { code, state, error }, req, res);
  }

  private startOAuth(provider: OAuthProvider, res: Response) {
    try {
      const state = randomBytes(16).toString('hex');
      setOAuthStateCookie(res, `${provider}.${state}`);
      res.redirect(buildAuthorizeUrl(provider, state));
    } catch (error) {
      redirectOAuthFailure(res, error);
    }
  }

  private async handleOAuthCallback(
    provider: OAuthProvider,
    query: { code?: string; state?: string; error?: string },
    req: Request,
    res: Response,
  ) {
    try {
      if (query.error) {
        throw new OAuthError('denied', query.error);
      }
      if (!query.code || !query.state) {
        throw new OAuthError('failed', 'Missing OAuth code');
      }

      const expected = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
      const prefix = `${provider}.`;
      if (
        !expected ||
        !expected.startsWith(prefix) ||
        !safeEqual(expected.slice(prefix.length), query.state)
      ) {
        throw new OAuthError('failed', 'Invalid OAuth state');
      }

      const profile = await fetchOAuthProfile(provider, query.code);
      const { sid, maxAge } = await this.auth.loginWithOAuth(profile);
      clearOAuthStateCookie(res);
      setSessionCookie(res, sid, maxAge);
      res.redirect(`${env.webOrigin}/dashboard`);
    } catch (error) {
      clearOAuthStateCookie(res);
      console.error('OAuth callback failed', error instanceof Error ? error.message : error);
      redirectOAuthFailure(res, error);
    }
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function redirectOAuthFailure(res: Response, error: unknown) {
  const code = error instanceof OAuthError ? error.code : 'failed';
  res.redirect(`${env.webOrigin}/login?oauth=${code}`);
}
