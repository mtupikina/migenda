import { Link } from 'react-router-dom';

import { calendarPath } from '../../calendarPeriod';

type MonthCalendarMoreProps = {
  count: number;
  date: Date;
};

export function MonthCalendarMore({ count, date }: MonthCalendarMoreProps) {
  if (count < 1) {
    return null;
  }

  return (
    <Link
      to={calendarPath('day', date)}
      className="mt-0.5 block text-[11px] font-bold text-accent-700 no-underline hover:text-accent"
    >
      +{count} more
    </Link>
  );
}
