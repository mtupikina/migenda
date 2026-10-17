import type { TeamRole } from '@migenda/shared';

const LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  member: 'Member',
};

export function teamRoleLabel(role: TeamRole): string {
  return LABELS[role];
}
