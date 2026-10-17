import { addDays, parseISO, startOfDay } from 'date-fns';
import type { ReportRange } from '@migenda/shared';

export type ReportWindow = {
  from: string;
  to: string;
};

/** Local-day boundaries as instants: `from` is the start of the first day, `to` the start of the day after the last. */
export function reportWindow(range: ReportRange): ReportWindow {
  return {
    from: startOfDay(parseISO(range.from)).toISOString(),
    to: startOfDay(addDays(parseISO(range.to), 1)).toISOString(),
  };
}
