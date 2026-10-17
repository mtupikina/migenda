import { Button, Group, Paper, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TeamInvite } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { invalidateTeam } from '../../api/invalidateTeam';
import { acceptInvite, declineInvite } from '../../api/team';
import { profileCardClassName } from '../../classNames/shared';

type PendingInviteRowProps = {
  invite: TeamInvite;
};

export function PendingInviteRow({ invite }: PendingInviteRowProps) {
  const queryClient = useQueryClient();
  const accept = useMutation({
    mutationFn: () => acceptInvite(invite.id),
    onSuccess: () => invalidateTeam(queryClient),
  });
  const decline = useMutation({
    mutationFn: () => declineInvite(invite.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-invites'] }),
  });
  const failure = [accept.error, decline.error].find((error) => error instanceof ScheduleRequestError);

  return (
    <Paper p={16} className={profileCardClassName}>
      <Group justify="space-between" wrap="nowrap" gap={16}>
        <Text fz={14}>
          <span className="font-semibold">{invite.invitedBy}</span> invited you to join{' '}
          <span className="font-semibold">{invite.teamName}</span>.
        </Text>
        <Group gap={8} wrap="nowrap">
          <Button type="button" loading={accept.isPending} disabled={decline.isPending} onClick={() => accept.mutate()}>
            Accept
          </Button>
          <Button
            type="button"
            variant="default"
            loading={decline.isPending}
            disabled={accept.isPending}
            onClick={() => decline.mutate()}
          >
            Decline
          </Button>
        </Group>
      </Group>
      {failure ? (
        <Text c="accent.7" fz={14} mt={8}>
          {failure.message}
        </Text>
      ) : null}
    </Paper>
  );
}
