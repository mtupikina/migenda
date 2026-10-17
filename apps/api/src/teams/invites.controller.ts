import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { TeamInvite } from '@migenda/shared';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { sessionId } from '../auth/session-id';
import { InvitesService } from './invites.service';

@Controller('invites')
export class InvitesController {
  constructor(
    private readonly auth: AuthService,
    private readonly invites: InvitesService,
  ) {}

  @Get()
  async pending(@Req() req: Request): Promise<TeamInvite[]> {
    const user = await this.auth.resolveUserFromSession(sessionId(req));
    return this.invites.pendingFor(user);
  }

  @Post(':inviteId/accept')
  async accept(@Req() req: Request, @Param('inviteId') inviteId: string): Promise<{ teamId: string }> {
    const user = await this.auth.resolveUserFromSession(sessionId(req));
    return this.invites.accept(inviteId, user);
  }

  @Post(':inviteId/decline')
  async decline(@Req() req: Request, @Param('inviteId') inviteId: string): Promise<void> {
    const user = await this.auth.resolveUserFromSession(sessionId(req));
    await this.invites.decline(inviteId, user);
  }
}
