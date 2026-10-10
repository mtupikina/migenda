import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssigneeOption, CreateEventInput, EventType } from '@migenda/shared';

import { createEvent, ScheduleRequestError, updateEvent } from '../../api/events';
import { dashboardFieldClassNames } from '../../classNames/shared';
import { defaultEventRange, newEventFormSchema, type NewEventFormValues } from '../../newEventForm';
import { EventDateField } from './EventDateField';
import { EventDateTimeField } from './EventDateTimeField';
import { WeekdayField } from './WeekdayField';

type NewEventFormProps = {
  types: EventType[];
  assignees: AssigneeOption[];
  initialTypeId: string | null;
  initialRange?: { start: string; end: string } | null;
  eventId?: string | null;
  occurrenceStart?: string | null;
  values?: NewEventFormValues | null;
  onCreateType: () => void;
  onCreated: () => void;
  onCancel: () => void;
};

export function NewEventForm({
  types,
  assignees,
  initialTypeId,
  initialRange,
  eventId = null,
  occurrenceStart = null,
  values = null,
  onCreateType,
  onCreated,
  onCancel,
}: NewEventFormProps) {
  const queryClient = useQueryClient();
  const range = initialRange ?? defaultEventRange();
  const editing = Boolean(eventId);
  const seeded: NewEventFormValues = values
    ? { ...values, typeId: initialTypeId ?? values.typeId }
    : {
        title: '',
        typeId: initialTypeId ?? '',
        assigneeId: assignees[0]?.id ?? '',
        start: range.start,
        end: range.end,
        weekdays: [],
        until: '',
        description: '',
      };
  const mutation = useMutation({
    mutationFn: (input: CreateEventInput) => {
      if (eventId) {
        return updateEvent(eventId, input, occurrenceStart);
      }
      return createEvent(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (eventId) {
        await queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      }
      onCreated();
    },
  });
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<NewEventFormValues>({
    resolver: zodResolver(newEventFormSchema),
    defaultValues: seeded,
  });
  const description = watch('description');

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        mutation.mutate({
          title: values.title,
          typeId: values.typeId,
          assigneeId: values.assigneeId,
          description: values.description,
          start: new Date(values.start).toISOString(),
          end: new Date(values.end).toISOString(),
          weekdays: values.weekdays,
          until: values.until || null,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      )}
    >
      <Stack gap={16}>
        <TextInput
          label="Title"
          maxLength={50}
          error={errors.title?.message}
          classNames={dashboardFieldClassNames}
          {...register('title')}
        />
        <Controller
          name="typeId"
          control={control}
          render={({ field }) => (
            <Select
              label="Event type"
              placeholder="Select a type…"
              data={types.map((type) => ({ value: type.id, label: type.name }))}
              value={field.value || null}
              onChange={(value) => field.onChange(value ?? '')}
              error={errors.typeId?.message}
              classNames={dashboardFieldClassNames}
            />
          )}
        />
        <Button type="button" variant="default" onClick={onCreateType}>
          Create a type
        </Button>
        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <EventDateTimeField
              label="Start"
              value={field.value}
              onChange={field.onChange}
              error={errors.start?.message}
            />
          )}
        />
        <Controller
          name="end"
          control={control}
          render={({ field }) => (
            <EventDateTimeField
              label="End"
              value={field.value}
              onChange={field.onChange}
              error={errors.end?.message}
            />
          )}
        />
        <Controller
          name="weekdays"
          control={control}
          render={({ field }) => (
            <WeekdayField value={field.value} onChange={field.onChange} error={errors.weekdays?.message} />
          )}
        />
        <Controller
          name="until"
          control={control}
          render={({ field }) => (
            <EventDateField
              label="Until"
              value={field.value}
              onChange={field.onChange}
              error={errors.until?.message}
            />
          )}
        />
        <Controller
          name="assigneeId"
          control={control}
          render={({ field }) => (
            <Select
              label="Assignee"
              data={assignees.map((person) => ({ value: person.id, label: person.name }))}
              allowDeselect={false}
              value={field.value || null}
              onChange={(value) => field.onChange(value ?? '')}
              error={errors.assigneeId?.message}
              classNames={dashboardFieldClassNames}
            />
          )}
        />
        <Textarea
          label="Description"
          placeholder="Add any details for this event…"
          maxLength={1000}
          rows={4}
          error={errors.description?.message}
          classNames={dashboardFieldClassNames}
          {...register('description')}
        />
        <Text fz={12} c="accent" ta="right">
          {description.length} / 1000
        </Text>
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
            {editing ? 'Save changes' : 'Create event'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
