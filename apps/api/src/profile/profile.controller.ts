import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Patch,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { clearSessionCookie } from '../auth/auth.cookies';
import { sessionId } from '../auth/session-id';
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