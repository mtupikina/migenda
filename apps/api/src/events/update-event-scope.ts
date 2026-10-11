import { shiftYmd, zonedLocalToUtc, zonedParts, zonedYmd } from './zoned-time';

export type EventScope = 'one' | 'following' | 'series';

export function editScope(repeating: boolean, scope: string | undefined): EventScope | null {
  if (!repeating) {
    return 'series';
  }
  if (scope === 'one' || scope === 'following' || scope === 'series') {
    return scope;
  }
  return null;
}

export function seriesClock(anchor: Date, start: Date, end: Date, timeZone: string): { start: Date; end: Date } {
  const clock = zonedParts(start, timeZone);
  const nextStart = zonedLocalToUtc(zonedYmd(anchor, timeZone), Number(clock.hour), Number(clock.minute), timeZone);
  const duration = end.getTime() - start.getTime();
  return { start: nextStart, end: new Date(nextStart.getTime() + duration) };
}

export function ruleBounds(
  start: Date,
  end: Date,
  weekdays: number[],
  until: string | null,
  timeZone: string,
): { from: Date; to: Date } {
  const day = 86_400_000;
  const from = new Date(start.getTime() - day);
  if (weekdays.length === 0) {
    return { from, to: new Date(end.getTime() + day) };
  }
  const horizon = new Date(Date.now() + 366 * day);
  if (!until) {
    return { from, to: horizon };
  }
  const untilEnd = zonedLocalToUtc(shiftYmd(until, 1), 0, 0, timeZone);
  const to = untilEnd.getTime() < horizon.getTime() ? untilEnd : horizon;
  return { from, to };
}
