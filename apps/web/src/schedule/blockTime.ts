import { addHours, format } from 'date-fns';
import { conflictingOccurrences, type Occurrence } from '@migenda/shared';

import { calendarRange, type CalendarView } from './calendarPeriod';

export function defaultBlockRange(
  view: CalendarView,
  date: Date,
  now: Date = new Date(),
): { start: string; end: string } {
  let targetDay = date;
  if (view !== 'day') {
    const range = calendarRange(view, date);
    const nowIso = now.toISOString();
    if (nowIso >= range.from && nowIso < range.to) {
      targetDay = now;
    }
  }
  const start = new Date(targetDay);
  start.setHours(now.getHours(), now.getMinutes(), 0, 0);
  const end = addHours(start, 1);
  return {
    start: format(start, "yyyy-MM-dd'T'HH:mm"),
    end: format(end, "yyyy-MM-dd'T'HH:mm"),
  };
}

export function formatTimeRange(start: string, end: string): string {
  const startFmt = format(new Date(start), 'HH:mm');
  const endFmt = format(new Date(end), 'HH:mm');
  return `${startFmt} – ${endFmt}`;
}

export function findConflictingEvents(
  occurrences: Occurrence[],
  startIso: string,
  endIso: string,
): Occurrence[] {
  const activeEvents = occurrences.filter((item) => !item.blocked);
  return conflictingOccurrences(activeEvents, { eventId: '', seriesStart: '' }, startIso, endIso);
}
