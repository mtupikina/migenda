import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ManagedEventType } from '@migenda/shared';

import { deleteEventType, ScheduleRequestError } from '../../api/events';
import { invalidateSchedule } from '../../api/invalidateSchedule';

type DeleteEventTypeDialogProps = {
  type: ManagedEventType;
  onClose: () => void;
};

export function DeleteEventTypeDialog({ type, onClose }: DeleteEventTypeDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteEventType(type.id),
    onSuccess: async () => {
      await invalidateSchedule(queryClient);
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
      opened
      onClose={close}
      title={`Delete ${type.name}?`}
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      <Stack gap={16}>
        <Text fz={14}>This removes the type. Events are not changed. This can&apos;t be undone.</Text>
        <Group justify="flex-end" gap={8}>
          <Button type="button" variant="default" disabled={mutation.isPending} onClick={close}>
            Cancel
          </Button>
          <Button type="button" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Delete type
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
