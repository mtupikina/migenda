import type { Occurrence } from '@migenda/shared';

import { EventExceptionDocument } from './event-exception.schema';
import { CalendarEventDocument } from './event.schema';
import { EventTypeDocument } from './event-type.schema';
import { expandEvent, ruleOf } from './expand-event';

export function collectOccurrences(
  rules: CalendarEventDocument[],
  exceptionDocs: EventExceptionDocument[],
  typeById: Map<string, EventTypeDocument>,
  from: Date,
  to: Date,
): Occurrence[] {
  const exceptionByKey = new Map(
    exceptionDocs.map((entry) => [exceptionKey(String(entry.eventId), entry.occurrenceStart), entry]),
  );
  const seen = new Set<string>();
  const placed: Occurrence[] = [];
  for (const rule of rules) {
    const expanded = expandEvent(ruleOf(rule), from, to);
    for (const item of expanded) {
      pushPlaced(placed, seen, rule, item.start, item.end, exceptionByKey, typeById, from, to);
    }
  }
  placed.sort((left, right) => left.start.localeCompare(right.start));
  return placed;
}

function pushPlaced(
  placed: Occurrence[],
  seen: Set<string>,
  rule: CalendarEventDocument,
  seriesStart: Date,
  seriesEnd: Date,
  exceptionByKey: Map<string, EventExceptionDocument>,
  typeById: Map<string, EventTypeDocument>,
  from: Date,
  to: Date,
): void {
  const key = exceptionKey(String(rule._id), seriesStart);
  if (seen.has(key)) {
    return;
  }
  const exception = exceptionByKey.get(key);
  if (exception?.deleted) {
    return;
  }
  if (seriesStart < from || seriesStart >= to) {
    return;
  }
  seen.add(key);
  const type = typeById.get(String(rule.typeId));
  placed.push({
    eventId: String(rule._id),
    start: seriesStart.toISOString(),
    end: seriesEnd.toISOString(),
    seriesStart: seriesStart.toISOString(),
    title: exception?.title || rule.title,
    typeName: type?.name ?? '',
    typeColor: type?.color ?? '',
    completed: exception?.completed ?? false,
    repeating: rule.weekdays.length > 0,
  });
}

function exceptionKey(eventId: string, start: Date): string {
  return `${eventId}:${start.toISOString()}`;
}
