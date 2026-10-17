import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import type { Team, TeamSummary } from '@migenda/shared';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { sessionId } from '../auth/session-id';
import { InviteMemberDto } from './invite-member.dto';
import { InvitesService } from './invites.service';
import { TeamMembershipService } from './team-membership.service';
import { TeamNameDto } from './team-name.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
    private readonly membership: TeamMembershipService,
    private readonly invites: InvitesService,
  ) {}

  @Get()
  async list(@Req() req: Request): Promise<TeamSummary[]> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.listFor(user._id, teamId);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: TeamNameDto): Promise<Team> {
    const { user } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.create(user, dto.name);
  }

  @Get('me')
  async current(@Req() req: Request): Promise<Team> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.teamFor(teamId, user._id);
  }

  @Patch('me')
  async rename(@Req() req: Request, @Body() dto: TeamNameDto): Promise<Team> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.rename(teamId, user._id, dto.name);
  }

  @Post('me/invites')
  async invite(@Req() req: Request, @Body() dto: InviteMemberDto): Promise<{ id: string }> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.invites.invite(teamId, user, dto.email);
  }

  @Post(':teamId/leave')
  async leave(@Req() req: Request, @Param('teamId') teamId: string): Promise<void> {
    const user = await this.auth.resolveUserFromSession(sessionId(req));
    await this.membership.leave(user, teamId);
  }
}
