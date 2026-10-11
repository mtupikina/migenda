import type {
  CreateEventInput,
  CreateEventTypeInput,
  Dashboard,
  DeleteEventScope,
  EventDetail,
  EventNote,
  EventType,
} from '@migenda/shared';

import { apiPath } from './apiPath';
import { dashboardRange, type DashboardRange } from '../schedule/dashboardRange';

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

export async function fetchNotes(eventId: string, occurrenceStart: string): Promise<EventNote[]> {
  const params = new URLSearchParams({ occurrenceStart });
  const response = await fetch(apiPath(`/events/${eventId}/notes?${params.toString()}`), {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not load notes.'));
  }
  return response.json() as Promise<EventNote[]>;
}

export async function createNote(eventId: string, occurrenceStart: string, text: string): Promise<EventNote> {
  const response = await fetch(apiPath(`/events/${eventId}/notes`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occurrenceStart, text }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not save the note.'));
  }
  return response.json() as Promise<EventNote>;
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

export async function moveEvent(
  eventId: string,
  occurrenceStart: string,
  start: string,
): Promise<{ id: string; start: string; end: string }> {
  const response = await fetch(apiPath(`/events/${eventId}/move`), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ occurrenceStart, start }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not move the task.'));
  }
  return response.json() as Promise<{ id: string; start: string; end: string }>;
}

export async function updateEvent(
  eventId: string,
  input: CreateEventInput,
  occurrenceStart?: string | null,
  scope?: DeleteEventScope | null,
): Promise<{ id: string; warning?: string }> {
  const response = await fetch(apiPath(`/events/${eventId}`), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...input,
      occurrenceStart: occurrenceStart ?? undefined,
      scope: scope ?? undefined,
    }),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not save the changes.'));
  }
  return response.json() as Promise<{ id: string; warning?: string }>;
}

export async function createEvent(input: CreateEventInput): Promise<{ id: string; warning?: string }> {
  const response = await fetch(apiPath('/events'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new ScheduleRequestError(await errorMessage(response, 'Could not create the task.'));
  }
  return response.json() as Promise<{ id: string; warning?: string }>;
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
