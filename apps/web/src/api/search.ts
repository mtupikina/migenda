import { startOfDay } from 'date-fns';
import type { SearchResponse } from '@migenda/shared';

import { apiPath } from './apiPath';
import { ScheduleRequestError } from './events';

export async function fetchSearch(q: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, from: startOfDay(new Date()).toISOString() });
  const response = await fetch(apiPath(`/search?${params.toString()}`), {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new ScheduleRequestError('Could not search.');
  }
  return response.json() as Promise<SearchResponse>;
}
