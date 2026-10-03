import type { CreateEventInput, CreateEventTypeInput, Dashboard, EventType } from '@migenda/shared';

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
