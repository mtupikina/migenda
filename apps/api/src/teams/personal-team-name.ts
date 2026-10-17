import { TEAM_NAME_MAX } from '@migenda/shared';

/** Name given to the team created for a new account. */
export function personalTeamName(firstName: string): string {
  const first = firstName.trim();
  const name = first ? `${first}'s team` : 'My team';
  return name.slice(0, TEAM_NAME_MAX);
}
