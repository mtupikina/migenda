import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createEventTypeSchema,
  EVENT_TYPE_COLORS,
  type CreateEventTypeInput,
  type ManagedEventType,
} from '@migenda/shared';

import { createEventType, ScheduleRequestError, updateEventType } from '../../api/events';
import { invalidateSchedule } from '../../api/invalidateSchedule';
import { EventTypeFields } from './EventTypeFields';

type EventTypeFormProps = {
  type: ManagedEventType | null;
  onSaved: () => void;
  onCancel: () => void;
};

export function EventTypeForm({ type, onSaved, onCancel }: EventTypeFormProps) {
  const queryClient = useQueryClient();
  const editing = type !== null;
  const mutation = useMutation({
    mutationFn: (values: CreateEventTypeInput) => {
      if (!type) {
        return createEventType(values);
      }
      return updateEventType(type.id, values);
    },
    onSuccess: async () => {
      await invalidateSchedule(queryClient);
      onSaved();
    },
  });
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<CreateEventTypeInput>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      name: type?.name ?? '',
      color: type?.color ?? EVENT_TYPE_COLORS[0].value,
    },
  });

  useEffect(() => {
    reset({
      name: type?.name ?? '',
      color: type?.color ?? EVENT_TYPE_COLORS[0].value,
    });
  }, [type, reset]);

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack gap={16}>
        <EventTypeFields register={register} control={control} errors={errors} />
        {mutation.error instanceof ScheduleRequestError ? (
          <Text c="accent.7" fz={14}>
            {mutation.error.message}
          </Text>
        ) : null}
        <Group justify="flex-end" gap={8}>
          <Button type="button" variant="default" disabled={mutation.isPending} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {editing ? 'Save changes' : 'Create type'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
