import { z } from 'zod';

import { assigneeOptionSchema, eventTypeSchema, ymd } from './event';

export const REPORT_PERIODS = [
  { id: 'this-week', label: 'This week' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'this-quarter', label: 'This quarter' },
  { id: 'custom-range', label: 'Custom range' },
] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number]['id'];

export const REPORT_RANGE_MAX_DAYS = 366;
export const REPORT_FIRST_PAGE_SIZE = 25;
export const REPORT_NEXT_PAGE_SIZE = 10;
export const REPORT_PAGE_SIZE_MAX = 50;

const DAY_MS = 86_400_000;

function ymdToUtc(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export const reportRangeSchema = z
  .object({
    from: ymd,
    to: ymd,
  })
  .refine((range) => range.to >= range.from, {
    path: ['to'],
    message: 'End date must be on or after the start date',
  })
  .refine((range) => (ymdToUtc(range.to) - ymdToUtc(range.from)) / DAY_MS < REPORT_RANGE_MAX_DAYS, {
    path: ['to'],
    message: 'Choose a range of one year or less',
  });

export type ReportRange = z.infer<typeof reportRangeSchema>;

export const reportStatusSchema = z.enum(['completed', 'not-completed', 'upcoming']);

export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const reportRowSchema = z.object({
  eventId: z.string(),
  occurrenceStart: z.string(),
  start: z.string(),
  end: z.string(),
  title: z.string(),
  description: z.string(),
  plannedMinutes: z.number(),
  status: reportStatusSchema,
  completedAt: z.string().nullable(),
  notes: z.number(),
  assignee: assigneeOptionSchema,
});

export type ReportRow = z.infer<typeof reportRowSchema>;

export const reportSummarySchema = z.object({
  scheduled: z.number(),
  completed: z.number(),
  notCompleted: z.number(),
  upcoming: z.number(),
  completionRate: z.number().nullable(),
  plannedMinutes: z.number(),
  completedMinutes: z.number(),
  notes: z.number(),
});

export type ReportSummary = z.infer<typeof reportSummarySchema>;

export const reportActivitySchema = z.object({
  title: z.string(),
  sessions: z.number(),
  completed: z.number(),
  completionRate: z.number().nullable(),
  plannedMinutes: z.number(),
});

export type ReportActivity = z.infer<typeof reportActivitySchema>;

export const reportResponseSchema = z.object({
  type: eventTypeSchema,
  summary: reportSummarySchema,
  activities: z.array(reportActivitySchema),
  assignees: z.array(assigneeOptionSchema),
  rows: z.array(reportRowSchema),
  total: z.number(),
});

export type ReportResponse = z.infer<typeof reportResponseSchema>;
