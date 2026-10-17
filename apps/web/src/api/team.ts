import type { InviteMemberInput, RenameTeamInput, Team, TeamInvite } from '@migenda/shared';

import { apiPath } from './apiPath';
import { ScheduleRequestError, errorMessage } from './events';

async function request(path: string, init: RequestInit, fallback: string): Promise<Response> {
  const response = await fetch(apiPath(path), { credentials: 'include', ...init });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, fallback));
  }
  return response;
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export async function fetchTeam(): Promise<Team> {
  const response = await request('/teams/me', {}, 'Could not load your team.');
  return response.json() as Promise<Team>;
}

export async function renameTeam(input: RenameTeamInput): Promise<Team> {
  const response = await request('/teams/me', json('PATCH', input), 'Could not rename the team.');
  return response.json() as Promise<Team>;
}

export async function inviteMember(input: InviteMemberInput): Promise<void> {
  await request('/teams/me/invites', json('POST', input), 'Could not send the invite.');
}

export async function fetchTeamInvites(): Promise<TeamInvite[]> {
  const response = await request('/invites', {}, 'Could not load your invites.');
  return response.json() as Promise<TeamInvite[]>;
}

export async function acceptInvite(inviteId: string): Promise<void> {
  await request(`/invites/${inviteId}/accept`, { method: 'POST' }, 'Could not accept the invite.');
}

export async function declineInvite(inviteId: string): Promise<void> {
  await request(`/invites/${inviteId}/decline`, { method: 'POST' }, 'Could not decline the invite.');
}
