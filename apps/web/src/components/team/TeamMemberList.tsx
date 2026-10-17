import { Stack, Text } from '@mantine/core';
import type { PendingMember, TeamMember } from '@migenda/shared';

import { teamRoleLabel } from '../../team/teamRoleLabel';
import { RemoveMemberButton } from './RemoveMemberButton';
import { TeamPersonRow } from './TeamPersonRow';

type TeamMemberListProps = {
  members: TeamMember[];
  pending: PendingMember[];
  viewerId: string;
  /** The owner can remove members (not themselves). */
  canRemove?: boolean;
};

export function TeamMemberList({ members, pending, viewerId, canRemove = false }: TeamMemberListProps) {
  return (
    <section aria-labelledby="team-members-label">
      <Text id="team-members-label" fz={12} mb={12} className="uppercase tracking-[0.06em] opacity-55">
        Members
      </Text>
      <Stack gap={12}>
        {members.map((member) => (
          <TeamPersonRow
            key={member.id}
            person={member}
            label={teamRoleLabel(member.role)}
            isYou={member.id === viewerId}
            action={
              canRemove && member.role !== 'owner' && member.id !== viewerId ? (
                <RemoveMemberButton member={member} />
              ) : null
            }
          />
        ))}
        {pending.map((person) => (
          <TeamPersonRow key={person.id} person={person} label="Pending" muted />
        ))}
      </Stack>
    </section>
  );
}
