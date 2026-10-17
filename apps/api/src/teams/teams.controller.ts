import { Controller, Get, Req } from '@nestjs/common';
import type { Team } from '@migenda/shared';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { sessionId } from '../auth/session-id';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
  ) {}

  @Get('me')
  async current(@Req() req: Request): Promise<Team> {
    const { user, teamId } = await this.auth.resolveTeamScope(sessionId(req));
    return this.teams.teamFor(teamId, user._id);
  }
}
