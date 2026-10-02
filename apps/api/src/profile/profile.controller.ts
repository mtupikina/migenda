import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { SESSION_COOKIE } from '../auth/auth.constants';
import { clearSessionCookie } from '../auth/auth.cookies';
import { PatchProfileDto } from './patch-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Patch()
  patchProfile(@Req() req: Request, @Body() dto: PatchProfileDto) {
    return this.profile.patchProfile(sessionId(req), dto);
  }

  @Delete()
  @HttpCode(200)
  async deleteAccount(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sid = sessionId(req);
    await this.profile.deleteAccount(sid);
    clearSessionCookie(res);
    return { ok: true };
  }
}

function sessionId(req: Request) {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) {
    throw new UnauthorizedException();
  }
  return sid;
}
