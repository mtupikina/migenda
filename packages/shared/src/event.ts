import { z } from 'zod';

export const EVENT_TITLE_MAX = 50;
export const EVENT_DESCRIPTION_MAX = 1000;
export const EVENT_TYPE_NAME_MAX = 50;

export const EVENT_TYPE_COLORS = [
  { id: 'red', label: 'Red', value: 'oklch(0.62 0.21 25)' },
  { id: 'orange', label: 'Orange', value: 'oklch(0.72 0.16 55)' },
  { id: 'amber', label: 'Amber', value: 'oklch(0.8 0.15 80)' },
  { id: 'yellow-green', label: 'Yellow-green', value: 'oklch(0.78 0.16 120)' },
  { id: 'green', label: 'Green', value: 'oklch(0.65 0.15 150)' },
  { id: 'teal', label: 'Teal', value: 'oklch(0.68 0.12 190)' },
  { id: 'blue', label: 'Blue', value: 'oklch(0.6 0.15 250)' },
  { id: 'indigo', label: 'Indigo', value: 'oklch(0.55 0.17 280)' },
  { id: 'purple', label: 'Purple', value: 'oklch(0.58 0.18 310)' },
  { id: 'pink', label: 'Pink', value: 'oklch(0.65 0.19 350)' },
] as const;

const eventTypeColorValues: readonly string[] = EVENT_TYPE_COLORS.map((color) => color.value);

export const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
] as const;

export const eventTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
});

export type EventType = z.infer<typeof eventTypeSchema>;

export const createEventTypeSchema = z.object({
  name: z.string().trim().min(1, 'Enter a type name').max(EVENT_TYPE_NAME_MAX, 'Use 50 characters or fewer'),
  color: z.string().refine((color) => eventTypeColorValues.includes(color), 'Choose a color'),
});

export type CreateEventTypeInput = z.infer<typeof createEventTypeSchema>;

export const assigneeOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type AssigneeOption = z.infer<typeof assigneeOptionSchema>;

const isoInstant = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date');

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date');

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, 'Enter a title').max(EVENT_TITLE_MAX, 'Use 50 characters or fewer'),
    typeId: z.string().min(1, 'Select a type'),
    description: z.string().max(EVENT_DESCRIPTION_MAX, 'Use 1000 characters or fewer'),
    start: isoInstant,
    end: isoInstant,
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
    until: ymd.nullable(),
    timeZone: z.string().min(1, 'Enter a time zone'),
    assigneeId: z.string().min(1, 'Select an assignee'),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.start);
    const end = new Date(value.end);
    if (end <= start) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'End must be after the start' });
    }
    const uniqueDays = new Set(value.weekdays);
    if (uniqueDays.size !== value.weekdays.length) {
      ctx.addIssue({ code: 'custom', path: ['weekdays'], message: 'Choose each day once' });
    }
    if (value.until && value.weekdays.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['weekdays'],
        message: 'Select at least one day to repeat',
      });
    }
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const eventDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  typeId: z.string(),
  description: z.string(),
  start: z.string(),
  end: z.string(),
  weekdays: z.array(z.number().int().min(0).max(6)),
  until: z.string().nullable(),
  timeZone: z.string(),
  assigneeId: z.string(),
});

export type EventDetail = z.infer<typeof eventDetailSchema>;

export const TIME_BLOCK_REASON_MAX = 1000;

export const occurrenceSchema = z.object({
  eventId: z.string(),
  start: z.string(),
  end: z.string(),
  seriesStart: z.string(),
  title: z.string(),
  typeName: z.string(),
  typeColor: z.string(),
  completed: z.boolean(),
  repeating: z.boolean(),
  blocked: z.boolean().default(false),
  reason: z.string().optional(),
});

export const createTimeBlockSchema = z.object({
  start: z.string().min(1, 'Enter a start time'),
  end: z.string().min(1, 'Enter an end time'),
  reason: z.string().max(TIME_BLOCK_REASON_MAX, 'Use 1000 characters or fewer').default(''),
});

export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>;

export const deleteEventScopeSchema = z.enum(['one', 'following', 'series']);

export type DeleteEventScope = z.infer<typeof deleteEventScopeSchema>;

export type Occurrence = z.infer<typeof occurrenceSchema>;

export function conflictingOccurrences<T extends Pick<Occurrence, 'eventId' | 'seriesStart' | 'start' | 'end'>>(
  occurrences: T[],
  moving: Pick<Occurrence, 'eventId' | 'seriesStart'>,
  start: string,
  end: string,
): T[] {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  return occurrences.filter((item) => otherOccupies(item, moving, startMs, endMs));
}

export function rangeIsOpen(
  occurrences: Pick<Occurrence, 'eventId' | 'seriesStart' | 'start' | 'end'>[],
  moving: Pick<Occurrence, 'eventId' | 'seriesStart'>,
  start: string,
  end: string,
): boolean {
  return conflictingOccurrences(occurrences, moving, start, end).length === 0;
}

function otherOccupies(
  item: Pick<Occurrence, 'eventId' | 'seriesStart' | 'start' | 'end'>,
  moving: Pick<Occurrence, 'eventId' | 'seriesStart'>,
  startMs: number,
  endMs: number,
): boolean {
  const same = item.eventId === moving.eventId && item.seriesStart === moving.seriesStart;
  if (same) {
    return false;
  }
  const itemStart = new Date(item.start).getTime();
  const itemEnd = new Date(item.end).getTime();
  return itemStart < endMs && startMs < itemEnd;
}

export const eventNoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  authorName: z.string(),
  createdAt: z.string(),
});

export type EventNote = z.infer<typeof eventNoteSchema>;

export const dashboardSchema = z.object({
  occurrences: z.array(occurrenceSchema),
  types: z.array(eventTypeSchema),
  assignees: z.array(assigneeOptionSchema),
});

export type Dashboard = z.infer<typeof dashboardSchema>;
