import { addDays, startOfDay } from 'date-fns';

export type DashboardRange = {
  from: string;
  to: string;
};

export function dashboardRange(now: Date): DashboardRange {
  const today = startOfDay(now);
  return {
    from: addDays(today, -1).toISOString(),
    to: addDays(today, 2).toISOString(),
  };
}
