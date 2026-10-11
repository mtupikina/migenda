import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Stack, Text, Textarea } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EVENT_DESCRIPTION_MAX } from '@migenda/shared';

import { createNote, ScheduleRequestError } from '../../api/events';
import { dashboardFieldClassNames } from '../../classNames/shared';
import { noteFormSchema, type NoteFormValues } from '../../schedule/noteForm';

type NoteComposeFormProps = {
  eventId: string;
  occurrenceStart: string;
  onClose: () => void;
};

export function NoteComposeForm({ eventId, occurrenceStart, onClose }: NoteComposeFormProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: { text: '' },
  });
  const mutation = useMutation({
    mutationFn: (text: string) => createNote(eventId, occurrenceStart, text),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes', eventId, occurrenceStart] });
      reset({ text: '' });
    },
  });
  const text = watch('text');
  const message = mutation.error instanceof ScheduleRequestError ? mutation.error.message : null;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        mutation.mutate(values.text);
      })}
    >
      <Stack gap={16}>
        <Textarea
          label="Add a note"
          placeholder="Add a note for this time slot…"
          maxLength={EVENT_DESCRIPTION_MAX}
          rows={3}
          error={errors.text?.message}
          classNames={dashboardFieldClassNames}
          {...register('text')}
        />
        <Text fz={12} c="accent" ta="right">
          {text.length} / {EVENT_DESCRIPTION_MAX}
        </Text>
        {message ? (
          <Text fz={13} c="accent.7">
            {message}
          </Text>
        ) : null}
        <Group justify="flex-end" gap={8}>
          <Button type="button" variant="default" disabled={mutation.isPending} onClick={onClose}>
            Close
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Add note
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
