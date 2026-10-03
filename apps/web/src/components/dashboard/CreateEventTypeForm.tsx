import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEventTypeSchema, EVENT_TYPE_COLORS, type CreateEventTypeInput } from '@migenda/shared';

import { createEventType, ScheduleRequestError } from '../../api/events';
import { dashboardFieldClassNames } from '../../classNames/shared';
import { EventTypeColorPicker } from './EventTypeColorPicker';

type CreateEventTypeFormProps = {
  onCreated: (typeId: string) => void;
  onCancel: () => void;
};

export function CreateEventTypeForm({ onCreated, onCancel }: CreateEventTypeFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createEventType,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onCreated(created.id);
    },
  });
  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateEventTypeInput>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      name: '',
      color: EVENT_TYPE_COLORS[0].value,
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack gap={16}>
        <TextInput
          label="Name"
          placeholder="e.g. Field trip"
          error={errors.name?.message}
          classNames={dashboardFieldClassNames}
          {...register('name')}
        />
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Stack gap={8}>
              <Text component="label" className={dashboardFieldClassNames.label}>
                Select color
              </Text>
              <EventTypeColorPicker value={field.value} onChange={field.onChange} />
              {errors.color?.message ? (
                <Text c="accent.7" fz={12}>
                  {errors.color.message}
                </Text>
              ) : null}
            </Stack>
          )}
        />
        {mutation.error instanceof ScheduleRequestError ? (
          <Text c="accent.7" fz={14}>
            {mutation.error.message}
          </Text>
        ) : null}
        <Group justify="flex-end" gap={8}>
          <Button type="button" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create type
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
