import { Body, Controller, Patch, Req } from '@nestjs/common';
import type { Team } from '@migenda/shared';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { sessionId } from '../auth/session-id';
import { SetActiveTeamDto } from './set-active-team.dto';
import { TeamsService } from './teams.service';

@Controller('users/me/active-team')
export class ActiveTeamController {
  constructor(
    private readonly auth: AuthService,
    private readonly teams: TeamsService,
  ) {}

  @Patch()
  async switchTeam(@Req() req: Request, @Body() dto: SetActiveTeamDto): Promise<Team> {
    const user = await this.auth.resolveUserFromSession(sessionId(req));
    return this.teams.switchTo(user, dto.teamId);
  }
}
