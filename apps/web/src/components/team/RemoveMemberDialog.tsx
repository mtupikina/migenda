import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userFullName, type TeamMember } from '@migenda/shared';

import { ScheduleRequestError } from '../../api/events';
import { invalidateTeam } from '../../api/invalidateTeam';
import { removeMember } from '../../api/team';

type RemoveMemberDialogProps = {
  member: TeamMember;
  opened: boolean;
  onClose: () => void;
};

export function RemoveMemberDialog({ member, opened, onClose }: RemoveMemberDialogProps) {
  const queryClient = useQueryClient();
  const name = userFullName(member) || member.email;
  const mutation = useMutation({
    mutationFn: () => removeMember(member.id),
    onSuccess: async (team) => {
      queryClient.setQueryData(['team'], team);
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
      title={`Remove ${name}?`}
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      <Stack gap={16}>
        <Text fz={14}>
          {name}'s events in this team will be reassigned to you. They can only come back if you invite them again.
        </Text>
        <Group gap={8}>
          <Button type="button" size="xs" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Remove
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
