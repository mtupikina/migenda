import type {
  CreateEventInput,
  CreateEventTypeInput,
  Dashboard,
  DeleteEventScope,
  EventDetail,
  EventType,
} from '@migenda/shared';

import { apiPath } from './apiPath';
import { dashboardRange, type DashboardRange } from '../dashboardRange';

export class ScheduleRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleRequestError';
  }
}

export async function fetchDashboard(range: DashboardRange = dashboardRange(new Date())): Promise<Dashboard> {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  const response = await fetch(apiPath(`/dashboard?${params.toString()}`), {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new ScheduleRequestError('Could not load your schedule.');
  }
  return response.json() as Promise<Dashboard>;
}

export async function deleteEvent(
  eventId: string,
  occurrenceStart: string,
  scope: DeleteEventScope,
): Promise<void> {
  const response = await fetch(apiPath(`/events/${eventId}/delete`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occurrenceStart, scope }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not delete the task.'));
  }
}

export async function duplicateEvent(
  eventId: string,
  occurrenceStart: string,
  occurrenceEnd: string,
): Promise<{ start: string }> {
  const response = await fetch(apiPath(`/events/${eventId}/duplicate`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occurrenceStart, occurrenceEnd }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not duplicate the task.'));
  }
  return response.json() as Promise<{ start: string }>;
}

export async function completeEvent(eventId: string, occurrenceStart: string): Promise<void> {
  const response = await fetch(apiPath(`/events/${eventId}/complete`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occurrenceStart }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not complete the task.'));
  }
}

export async function fetchEvent(eventId: string, occurrenceStart?: string | null): Promise<EventDetail> {
  const params = new URLSearchParams();
  if (occurrenceStart) {
    params.set('occurrenceStart', occurrenceStart);
  }
  const query = params.size > 0 ? `?${params.toString()}` : '';
  const response = await fetch(apiPath(`/events/${eventId}${query}`), { credentials: 'include' });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not load this event.'));
  }
  return response.json() as Promise<EventDetail>;
}

export async function updateEvent(
  eventId: string,
  input: CreateEventInput,
  occurrenceStart?: string | null,
): Promise<void> {
  const response = await fetch(apiPath(`/events/${eventId}`), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, occurrenceStart: occurrenceStart ?? undefined }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not save the changes.'));
  }
}

export async function createEvent(input: CreateEventInput): Promise<void> {
  const response = await fetch(apiPath('/events'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not create the task.'));
  }
}

export async function createEventType(input: CreateEventTypeInput): Promise<EventType> {
  const response = await fetch(apiPath('/event-types'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not create the type.'));
  }
  return response.json() as Promise<EventType>;
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: unknown } | null;
  if (typeof body?.message === 'string') {
    return body.message;
  }
  if (Array.isArray(body?.message)) {
    return body.message.join(' ');
  }
  return fallback;
}
