import type { Occurrence } from '@migenda/shared';

import { bookedMinutes, completedOn, countOn, firstStartOn, shiftDay } from '../../dashboardDays';
import { formatBookedTime } from '../../formatBookedTime';
import { DashboardDayStat } from './DashboardDayStat';

type DashboardDayStatsProps = {
  occurrences: Occurrence[];
  now: Date;
};

export function DashboardDayStats({ occurrences, now }: DashboardDayStatsProps) {
  const yesterday = shiftDay(now, -1);
  const today = shiftDay(now, 0);
  const tomorrow = shiftDay(now, 1);
  const firstTomorrow = firstStartOn(occurrences, tomorrow);

  return (
    <>
      <DashboardDayStat
        label="Yesterday"
        count={countOn(occurrences, yesterday)}
        caption="scheduled"
        detail={`${completedOn(occurrences, yesterday)} completed`}
      />
      <DashboardDayStat
        label="Today"
        count={countOn(occurrences, today)}
        caption="scheduled"
        detail={formatBookedTime(bookedMinutes(occurrences, today))}
      />
      <DashboardDayStat
        label="Tomorrow"
        count={countOn(occurrences, tomorrow)}
        caption="planned"
        detail={firstTomorrow ? `from ${firstTomorrow}` : '—'}
      />
    </>
  );
}
