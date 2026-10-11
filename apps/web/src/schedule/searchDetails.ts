import type { SearchEventHit, SearchNoteHit } from '@migenda/shared';

export type SearchDetailsTarget = {
  eventId: string;
  occurrenceStart: string;
  at: string;
  scrollToNotes: boolean;
};

export function searchDetailsFromEvent(hit: SearchEventHit): SearchDetailsTarget {
  return {
    eventId: hit.eventId,
    occurrenceStart: hit.occurrenceStart,
    at: hit.start,
    scrollToNotes: false,
  };
}

export function searchDetailsFromNote(hit: SearchNoteHit): SearchDetailsTarget {
  return {
    eventId: hit.eventId,
    occurrenceStart: hit.occurrenceStart,
    at: hit.occurrenceStart,
    scrollToNotes: true,
  };
}
