import { z } from 'zod';

export const SEARCH_QUERY_MAX = 100;
export const SEARCH_RESULT_MAX = 50;

export const searchEventHitSchema = z.object({
  kind: z.literal('event'),
  eventId: z.string(),
  occurrenceStart: z.string(),
  start: z.string(),
  title: z.string(),
  excerpt: z.string(),
});

export type SearchEventHit = z.infer<typeof searchEventHitSchema>;

export const searchNoteHitSchema = z.object({
  kind: z.literal('note'),
  id: z.string(),
  eventId: z.string(),
  occurrenceStart: z.string(),
  createdAt: z.string(),
  authorName: z.string(),
  excerpt: z.string(),
});

export type SearchNoteHit = z.infer<typeof searchNoteHitSchema>;

export const searchHitSchema = z.discriminatedUnion('kind', [searchEventHitSchema, searchNoteHitSchema]);

export type SearchHit = z.infer<typeof searchHitSchema>;

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(searchHitSchema),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

export function escapeSearchRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function searchMatchParts(text: string, query: string): { text: string; match: boolean }[] {
  const needle = query.trim();
  if (!needle) {
    return [{ text, match: false }];
  }
  const chunks = text.split(new RegExp(`(${escapeSearchRegex(needle)})`, 'gi'));
  return chunks.filter((part) => part.length > 0).map((part) => ({
    text: part,
    match: part.toLowerCase() === needle.toLowerCase(),
  }));
}
