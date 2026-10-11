import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssigneeOption, CreateEventInput, DeleteEventScope, EventType } from '@migenda/shared';

import { createEvent, ScheduleRequestError, updateEvent } from '../../api/events';
import { dashboardFieldClassNames } from '../../classNames/shared';
import { defaultEventRange, newEventFormSchema, type NewEventFormValues } from '../../schedule/newEventForm';
import { EditEventSave } from './EditEventSave';
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
  repeating?: boolean;
  values?: NewEventFormValues | null;
  onCreateType: () => void;
  onCreated: (warning?: string) => void;
  onCancel: () => void;
};

export function NewEventForm({
  types,
  assignees,
  initialTypeId,
  initialRange,
  eventId = null,
  occurrenceStart = null,
  repeating = false,
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
    mutationFn: (input: CreateEventInput & { scope: DeleteEventScope | null }) => {
      if (eventId) {
        return updateEvent(eventId, input, occurrenceStart, input.scope);
      }
      return createEvent(input);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['event'] });
      onCreated(data?.warning);
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
  const pending = mutation.isPending ? (mutation.variables?.scope ?? 'create') : null;
  const save = (scope: DeleteEventScope | null) => {
    void handleSubmit((formValues) => {
      mutation.mutate({
        title: formValues.title,
        typeId: formValues.typeId,
        assigneeId: formValues.assigneeId,
        description: formValues.description,
        start: new Date(formValues.start).toISOString(),
        end: new Date(formValues.end).toISOString(),
        weekdays: formValues.weekdays,
        until: formValues.until || null,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        scope,
      });
    })();
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (repeating) {
          return;
        }
        save(editing ? 'series' : null);
      }}
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
        <EditEventSave
          editing={editing}
          repeating={repeating}
          pending={pending}
          onCancel={onCancel}
          onSave={save}
        />
      </Stack>
    </form>
  );
}
