import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subMonths,
} from 'date-fns';
import type { ReportPeriod, ReportRange } from '@migenda/shared';

import { dayKey } from './dashboardDays';

type PresetPeriod = Exclude<ReportPeriod, 'custom-range'>;

type Bounds = {
  start: Date;
  end: Date;
};

export function resolveReportRange(period: ReportPeriod, custom: ReportRange, now: Date): ReportRange {
  if (period === 'custom-range') {
    return custom;
  }
  const bounds = presetBounds(period, now);
  return { from: dayKey(bounds.start), to: dayKey(bounds.end) };
}

function presetBounds(period: PresetPeriod, now: Date): Bounds {
  if (period === 'this-week') {
    return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  }
  if (period === 'this-month') {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }
  if (period === 'last-month') {
    const lastMonth = subMonths(now, 1);
    return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
  }
  return { start: startOfQuarter(now), end: endOfQuarter(now) };
}
