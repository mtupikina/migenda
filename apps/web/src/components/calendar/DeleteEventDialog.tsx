import { format } from 'date-fns';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeleteEventScope, Occurrence } from '@migenda/shared';

import { deleteEvent, ScheduleRequestError } from '../../api/events';

type DeleteEventDialogProps = {
  occurrence: Occurrence | null;
  onClose: () => void;
};

export function DeleteEventDialog({ occurrence, onClose }: DeleteEventDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (scope: DeleteEventScope) => {
      if (!occurrence) {
        throw new Error('Missing event');
      }
      return deleteEvent(occurrence.eventId, occurrence.seriesStart, scope);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
  });
  const pending = mutation.isPending ? mutation.variables : null;
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
      opened={occurrence !== null}
      onClose={close}
      title="Delete this event?"
      centered
      size={520}
      radius={0}
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
      withCloseButton={!mutation.isPending}
    >
      {occurrence ? (
        <Stack gap={16}>
          <Text fz={14}>
            "{occurrence.title}" on {format(new Date(occurrence.start), "EEEE, MMMM d 'at' HH:mm")}. This can't be
            undone.
          </Text>
          <Group gap={8}>
            <Button
              type="button"
              size="xs"
              disabled={mutation.isPending}
              loading={pending === 'one'}
              onClick={() => mutation.mutate('one')}
            >
              This event
            </Button>
            {occurrence.repeating ? (
              <Button
                type="button"
                size="xs"
                disabled={mutation.isPending}
                loading={pending === 'following'}
                onClick={() => mutation.mutate('following')}
              >
                This and future events
              </Button>
            ) : null}
            {occurrence.repeating ? (
              <Button
                type="button"
                size="xs"
                disabled={mutation.isPending}
                loading={pending === 'series'}
                onClick={() => mutation.mutate('series')}
              >
                All events
              </Button>
            ) : null}
          </Group>
          {message ? (
            <Text fz={13} c="accent.7">
              {message}
            </Text>
          ) : null}
        </Stack>
      ) : null}
    </Modal>
  );
}
