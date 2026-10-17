import { Stack, Text } from '@mantine/core';
import type { TeamInvite } from '@migenda/shared';

import { PendingInviteRow } from './PendingInviteRow';

type PendingInvitesProps = {
  invites: TeamInvite[];
};

export function PendingInvites({ invites }: PendingInvitesProps) {
  return (
    <section aria-labelledby="team-invites-label">
      <Text id="team-invites-label" fz={12} mb={12} className="uppercase tracking-[0.06em] opacity-55">
        Invitations
      </Text>
      <Stack gap={12}>
        {invites.map((invite) => (
          <PendingInviteRow key={invite.id} invite={invite} />
        ))}
      </Stack>
    </section>
  );
}
