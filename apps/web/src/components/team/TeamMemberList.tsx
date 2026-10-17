import { Stack, Text } from '@mantine/core';
import type { TeamMember } from '@migenda/shared';

import { TeamMemberRow } from './TeamMemberRow';

type TeamMemberListProps = {
  members: TeamMember[];
  viewerId: string;
};

export function TeamMemberList({ members, viewerId }: TeamMemberListProps) {
  return (
    <section aria-labelledby="team-members-label">
      <Text id="team-members-label" fz={12} mb={12} className="uppercase tracking-[0.06em] opacity-55">
        Members
      </Text>
      <Stack gap={12}>
        {members.map((member) => (
          <TeamMemberRow key={member.id} member={member} isYou={member.id === viewerId} />
        ))}
      </Stack>
    </section>
  );
}
