import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Team } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { invalidateTeam } from '../../api/invalidateTeam';
import { deleteTeam } from '../../api/team';

type DeleteTeamDialogProps = {
  team: Team;
  opened: boolean;
  onClose: () => void;
};

export function DeleteTeamDialog({ team, opened, onClose }: DeleteTeamDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteTeam(team.id),
    onSuccess: async () => {
      await invalidateTeam(queryClient);
      onClose();
    },
  });
  const message = mutation.error instanceof ScheduleRequestError ? mutation.error.message : null;

  const close = () => {
    if (mutation.isPending) {
      return;
    }
    mutation.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Delete ${team.name}?`}
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      <Stack gap={16}>
        <Text fz={14}>
          This permanently removes the team and all of its events, types, and notes. Pending invites are cancelled.
          Other members move to another team they already belong to, or get a new team if this was their only one. You
          will switch to another team you belong to.
        </Text>
        <Group gap={8}>
          <Button type="button" size="xs" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Delete team
          </Button>
          <Button type="button" size="xs" variant="default" disabled={mutation.isPending} onClick={close}>
            Cancel
          </Button>
        </Group>
        {message ? (
          <Text fz={13} c="accent.7">
            {message}
          </Text>
        ) : null}
      </Stack>
    </Modal>
  );
}
