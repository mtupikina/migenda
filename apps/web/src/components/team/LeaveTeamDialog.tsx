import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userFullName, type Team } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { invalidateTeam } from '../../api/invalidateTeam';
import { leaveTeam } from '../../api/team';

type LeaveTeamDialogProps = {
  team: Team;
  opened: boolean;
  onClose: () => void;
};

export function LeaveTeamDialog({ team, opened, onClose }: LeaveTeamDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => leaveTeam(team.id),
    onSuccess: async () => {
      await invalidateTeam(queryClient);
      onClose();
    },
  });
  const owner = team.members.find((member) => member.role === 'owner');
  const ownerName = owner ? userFullName(owner) || owner.email : 'the team owner';
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
      title={`Leave ${team.name}?`}
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      <Stack gap={16}>
        <Text fz={14}>
          Your events in this team will be reassigned to {ownerName}. You can only come back if the owner invites you
          again.
        </Text>
        <Group gap={8}>
          <Button type="button" size="xs" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Leave team
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
