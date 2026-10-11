import type { Occurrence } from '@migenda/shared';

export function findOccurrence(
  occurrences: Occurrence[],
  eventId: string,
  start: string,
): Occurrence | undefined {
  return occurrences.find(
    (item) => item.eventId === eventId && (item.seriesStart === start || item.start === start),
  );
}
