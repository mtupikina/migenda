import { Stack, Text } from '@mantine/core';
import type { PendingMember, TeamMember } from '@migenda/shared';

import { teamRoleLabel } from '../../team/teamRoleLabel';
import { TeamPersonRow } from './TeamPersonRow';

type TeamMemberListProps = {
  members: TeamMember[];
  pending: PendingMember[];
  viewerId: string;
};

export function TeamMemberList({ members, pending, viewerId }: TeamMemberListProps) {
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
          />
        ))}
        {pending.map((person) => (
          <TeamPersonRow key={person.id} person={person} label="Pending" muted />
        ))}
      </Stack>
    </section>
  );
}
