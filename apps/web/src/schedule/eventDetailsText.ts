import { format } from 'date-fns';
import { WEEKDAYS, type AssigneeOption, type EventType } from '@migenda/shared';

export const EVENT_DETAILS_LOAD_ERROR = 'Could not load this event.';

export function formatEventWhen(iso: string): string {
  return format(new Date(iso), 'EEEE, MMMM d · HH:mm');
}

export function formatRepeatDays(weekdays: number[]): string {
  if (weekdays.length === 0) {
    return 'Does not repeat';
  }
  return WEEKDAYS.filter((day) => weekdays.includes(day.value))
    .map((day) => day.label)
    .join(', ');
}

export function formatUntilDate(until: string | null): string {
  if (!until) {
    return '—';
  }
  return format(new Date(`${until}T00:00:00`), 'MMMM d, yyyy');
}

export function eventTypeLabel(types: EventType[], typeId: string, fallback: string): string {
  return types.find((type) => type.id === typeId)?.name || fallback || '—';
}

export function eventAssigneeLabel(assignees: AssigneeOption[], assigneeId: string): string {
  return assignees.find((person) => person.id === assigneeId)?.name || '—';
}
