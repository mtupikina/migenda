import { z } from 'zod';

import { ymd } from './event';

export const REPORT_PERIODS = [
  { id: 'this-week', label: 'This week' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'this-quarter', label: 'This quarter' },
  { id: 'custom-range', label: 'Custom range' },
] as const;

export type ReportPeriod = (typeof REPORT_PERIODS)[number]['id'];

export const reportRangeSchema = z
  .object({
    from: ymd,
    to: ymd,
  })
  .refine((range) => range.to >= range.from, {
    path: ['to'],
    message: 'End date must be on or after the start date',
  });

export type ReportRange = z.infer<typeof reportRangeSchema>;
