import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import type { Team } from '@migenda/shared';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { sessionId } from '../auth/session-id';
import { InviteMemberDto } from './invite-member.dto';
import { InvitesService } from './invites.service';
import { RenameTeamDto } from './rename-team.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
    private readonly invites: InvitesService,
  ) {}

  @Get('me')
  async current(@Req() req: Request): Promise<Team> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.teamFor(teamId, user._id);
  }

  @Patch('me')
  async rename(@Req() req: Request, @Body() dto: RenameTeamDto): Promise<Team> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.rename(teamId, user._id, dto.name);
  }

  @Post('me/invites')
  async invite(@Req() req: Request, @Body() dto: InviteMemberDto): Promise<{ id: string }> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.invites.invite(teamId, user, dto.email);
  }
}
