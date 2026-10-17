import type { PendingMember, Team as TeamDto, TeamMember, TeamRole, TeamSummary } from '@migenda/shared';

import type { UserDocument } from '../auth/user.schema';
import type { TeamDocument } from './team.schema';

export type MemberRecord = {
  user: UserDocument;
  role: TeamRole;
};

/** An invited person together with the id of their invitation. */
export type PendingRecord = {
  user: UserDocument;
  inviteId: string;
};

export function toTeamMember({ user, role }: MemberRecord): TeamMember {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    jobTitle: user.role ?? '',
    avatarUrl: user.avatarUrl,
    role,
  };
}

export function toPendingMember({ user, inviteId }: PendingRecord): PendingMember {
  return {
    id: inviteId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export function toTeamSummary(team: TeamDocument, role: TeamRole, active: boolean): TeamSummary {
  return { id: String(team._id), name: team.name, role, active };
}

/** The owner comes first, everyone else keeps the order they were given. */
export function ownerFirst(members: MemberRecord[]): MemberRecord[] {
  return [...members].sort((a, b) => Number(b.role === 'owner') - Number(a.role === 'owner'));
}

export function toTeam(
  team: TeamDocument,
  members: MemberRecord[],
  pending: PendingRecord[],
  viewerRole: TeamRole,
): TeamDto {
  return {
    id: String(team._id),
    name: team.name,
    role: viewerRole,
    members: ownerFirst(members).map(toTeamMember),
    pending: pending.map(toPendingMember),
  };
}
