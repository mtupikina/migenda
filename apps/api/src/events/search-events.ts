import type { SearchEventHit, SearchHit, SearchNoteHit } from '@migenda/shared';
import { SEARCH_RESULT_MAX } from '@migenda/shared';

import { containsInstant, expandEvent, ruleFrom, type EventRule } from './expand-event';
import { ruleBounds } from './update-event-scope';

export type SearchEventRecord = {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
  weekdays: number[];
  until: string | null;
};

export type SearchExceptionRecord = {
  eventId: string;
  occurrenceStart: Date;
  deleted: boolean;
  title?: string;
  description?: string;
};

export type SearchNoteRecord = {
  id: string;
  eventId: string;
  occurrenceStart: Date;
  createdAt: Date;
  authorName: string;
  text: string;
};

type CollectSearchResultsInput = {
  seriesIds: string[];
  exceptionMatches: SearchExceptionRecord[];
  notes: SearchNoteRecord[];
  events: SearchEventRecord[];
  exceptions: SearchExceptionRecord[];
  from: Date;
  limit?: number;
};

export function collectSearchResults(input: CollectSearchResultsInput): SearchHit[] {
  const eventById = new Map(input.events.map((event) => [event.id, event]));
  const deleted = new Set(
    input.exceptions.filter((item) => item.deleted).map((item) => occurrenceRef(item.eventId, item.occurrenceStart)),
  );
  const liveException = new Map(
    input.exceptions
      .filter((item) => !item.deleted)
      .map((item) => [occurrenceRef(item.eventId, item.occurrenceStart), item]),
  );
  const eventHits: SearchEventHit[] = [];
  const seen = new Set<string>();

  for (const eventId of input.seriesIds) {
    const event = eventById.get(eventId);
    if (!event) {
      continue;
    }
    const occurrence = pickLiveOccurrence(event, deleted, input.from);
    if (!occurrence) {
      continue;
    }
    const key = occurrenceRef(eventId, occurrence.start);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    eventHits.push(toEventHit(event, occurrence.start, liveException.get(key)));
  }

  for (const match of input.exceptionMatches) {
    const key = occurrenceRef(match.eventId, match.occurrenceStart);
    const unavailable = match.deleted || seen.has(key) || deleted.has(key);
    if (unavailable || match.occurrenceStart < input.from) {
      continue;
    }
    const event = eventById.get(match.eventId);
    if (!event) {
      continue;
    }
    if (!containsInstant(eventRule(event), match.occurrenceStart)) {
      continue;
    }
    seen.add(key);
    eventHits.push(toEventHit(event, match.occurrenceStart, match));
  }

  const noteHits: SearchNoteHit[] = [];
  for (const note of input.notes) {
    const event = eventById.get(note.eventId);
    if (!event) {
      continue;
    }
    if (note.occurrenceStart < input.from || deleted.has(occurrenceRef(note.eventId, note.occurrenceStart))) {
      continue;
    }
    if (!containsInstant(eventRule(event), note.occurrenceStart)) {
      continue;
    }
    noteHits.push({
      kind: 'note',
      id: note.id,
      eventId: note.eventId,
      occurrenceStart: note.occurrenceStart.toISOString(),
      createdAt: note.createdAt.toISOString(),
      authorName: note.authorName,
      excerpt: note.text,
    });
  }

  const soonestFirst = [...eventHits, ...noteHits].sort(compareSearchHits);
  return soonestFirst.slice(0, input.limit ?? SEARCH_RESULT_MAX);
}

function pickLiveOccurrence(
  event: SearchEventRecord,
  deleted: Set<string>,
  from: Date,
): { start: Date; end: Date } | null {
  const bounds = ruleBounds(event.start, event.end, event.weekdays, event.until, event.timeZone);
  return (
    expandEvent(eventRule(event), bounds.from, bounds.to).find(
      (item) => item.start >= from && !deleted.has(occurrenceRef(event.id, item.start)),
    ) ?? null
  );
}

function compareSearchHits(left: SearchHit, right: SearchHit): number {
  const byTime = left.occurrenceStart.localeCompare(right.occurrenceStart);
  if (byTime !== 0) {
    return byTime;
  }
  if (left.kind === right.kind) {
    return 0;
  }
  return left.kind === 'event' ? -1 : 1;
}

function toEventHit(
  event: SearchEventRecord,
  start: Date,
  exception: SearchExceptionRecord | undefined,
): SearchEventHit {
  return {
    kind: 'event',
    eventId: event.id,
    occurrenceStart: start.toISOString(),
    start: start.toISOString(),
    title: exception?.title || event.title,
    excerpt: exception?.description ?? event.description,
  };
}

function eventRule(event: SearchEventRecord): EventRule {
  return ruleFrom(event.id, event.start, event.end, event.timeZone, event.weekdays, event.until);
}

function occurrenceRef(eventId: string, start: Date): string {
  return `${eventId}:${start.toISOString()}`;
}
