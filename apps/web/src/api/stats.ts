import { publicStatsSchema, type PublicStats } from '@migenda/shared';

import { apiPath } from './apiPath';

export async function fetchPublicStats(): Promise<PublicStats> {
  const response = await fetch(apiPath('/stats'));
  if (!response.ok) {
    throw new Error('Could not load stats.');
  }
  return publicStatsSchema.parse(await response.json());
}
