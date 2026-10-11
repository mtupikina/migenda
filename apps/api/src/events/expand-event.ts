import { isValidTimeZone, zonedLocalToUtc, zonedParts, zonedYmd } from './zoned-time';

export type EventRule = {
  id: string;
  start: Date;
  end: Date;
  timeZone: string;
  weekdays: number[];
  until: string | null;
};

type DatedRule = {
  _id: { toString(): string };
  start: Date;
  end: Date;
  timeZone: string;
  weekdays: number[];
  until: string | null;
};

export function ruleFrom(
  id: string,
  start: Date,
  end: Date,
  timeZone: string,
  weekdays: number[],
  until: string | null,
): EventRule {
  return { id, start, end, timeZone, weekdays, until };
}

export function ruleOf(event: DatedRule): EventRule {
  return ruleFrom(String(event._id), event.start, event.end, event.timeZone, event.weekdays, event.until);
}

export type ExpandedOccurrence = {
  eventId: string;
  start: Date;
  end: Date;
};

export function expandEvent(rule: EventRule, from: Date, to: Date): ExpandedOccurrence[] {
  const duration = rule.end.getTime() - rule.start.getTime();
  if (!isValidTimeZone(rule.timeZone)) {
    return [];
  }
  if (rule.weekdays.length === 0) {
    return singleOccurrence(rule, duration, from, to);
  }
  return weekdayOccurrences(rule, duration, from, to);
}

export function containsInstant(rule: EventRule, instant: Date): boolean {
  const from = new Date(instant.getTime() - 1);
  const to = new Date(instant.getTime() + 1);
  return expandEvent(rule, from, to).some((item) => item.start.getTime() === instant.getTime());
}

function singleOccurrence(
  rule: EventRule,
  duration: number,
  from: Date,
  to: Date,
): ExpandedOccurrence[] {
  const inWindow = rule.start >= from && rule.start < to;
  if (!inWindow) {
    return [];
  }
  return [occurrence(rule.id, rule.start, duration)];
}

function weekdayOccurrences(
  rule: EventRule,
  duration: number,
  from: Date,
  to: Date,
): ExpandedOccurrence[] {
  const clock = zonedParts(rule.start, rule.timeZone);
  const hour = Number(clock.hour);
  const minute = Number(clock.minute);
  const startYmd = zonedYmd(rule.start, rule.timeZone);
  const scanFrom = laterYmd(startYmd, addYmd(zonedYmd(from, rule.timeZone), -1));
  const windowEnd = addYmd(zonedYmd(new Date(to.getTime() - 1), rule.timeZone), 1);
  const scanTo = rule.until && rule.until < windowEnd ? rule.until : windowEnd;
  const matches = new Set(rule.weekdays);
  const occurrences: ExpandedOccurrence[] = [];
  let cursor = scanFrom;
  while (cursor <= scanTo) {
    const onSelectedDay = matches.has(weekdayOfYmd(cursor));
    const onOrAfterStart = cursor >= startYmd;
    const onOrBeforeUntil = !rule.until || cursor <= rule.until;
    const shouldCheck = onSelectedDay && onOrAfterStart && onOrBeforeUntil;
    if (shouldCheck) {
      const start = zonedLocalToUtc(cursor, hour, minute, rule.timeZone);
      pushIfInWindow(occurrences, rule.id, start, duration, from, to);
    }
    cursor = addYmd(cursor, 1);
  }
  return occurrences;
}

function pushIfInWindow(
  occurrences: ExpandedOccurrence[],
  eventId: string,
  start: Date,
  duration: number,
  from: Date,
  to: Date,
): void {
  if (start >= from && start < to) {
    occurrences.push(occurrence(eventId, start, duration));
  }
}

function occurrence(eventId: string, start: Date, duration: number): ExpandedOccurrence {
  return {
    eventId,
    start,
    end: new Date(start.getTime() + duration),
  };
}

function laterYmd(left: string, right: string): string {
  return left > right ? left : right;
}

function weekdayOfYmd(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function addYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}
