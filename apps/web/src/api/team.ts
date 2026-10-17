import type { Team } from '@migenda/shared';

import { apiPath } from './apiPath';
import { ScheduleRequestError, errorMessage } from './events';

export async function fetchTeam(): Promise<Team> {
  const response = await fetch(apiPath('/teams/me'), { credentials: 'include' });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not load your team.'));
  }
  return response.json() as Promise<Team>;
}
