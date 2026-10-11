import { Stack } from '@mantine/core';
import type { AssigneeOption, EventDetail, EventType, Occurrence } from '@migenda/shared';

import {
  eventAssigneeLabel,
  eventTypeLabel,
  formatEventWhen,
  formatRepeatDays,
  formatUntilDate,
} from '../../schedule/eventDetailsText';
import { EventDetailsField } from './EventDetailsField';

type EventDetailsFieldsProps = {
  event: EventDetail;
  occurrence: Occurrence;
  types: EventType[];
  assignees: AssigneeOption[];
};

export function EventDetailsFields({ event, occurrence, types, assignees }: EventDetailsFieldsProps) {
  const status = occurrence.completed ? 'Completed' : 'Scheduled';
  return (
    <Stack gap={16}>
      <EventDetailsField label="Title" value={event.title} />
      <EventDetailsField label="Event type" value={eventTypeLabel(types, event.typeId, occurrence.typeName)} />
      <EventDetailsField label="Start" value={formatEventWhen(event.start)} />
      <EventDetailsField label="End" value={formatEventWhen(event.end)} />
      <EventDetailsField label="Repeats" value={formatRepeatDays(event.weekdays)} />
      <EventDetailsField label="Until" value={formatUntilDate(event.until)} />
      <EventDetailsField label="Assignee" value={eventAssigneeLabel(assignees, event.assigneeId)} />
      <EventDetailsField label="Description" value={event.description.trim() || '—'} />
      <EventDetailsField label="Status" value={status} />
    </Stack>
  );
}
