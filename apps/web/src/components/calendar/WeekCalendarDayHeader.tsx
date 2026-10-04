import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import { calendarPath } from '../../calendarPeriod';
import { dayKey } from '../../dashboardDays';

type WeekCalendarDayHeaderProps = {
  date: Date;
};

export function WeekCalendarDayHeader({ date }: WeekCalendarDayHeaderProps) {
  const isToday = dayKey(date) === dayKey(new Date());
  const faded = !isToday && (date.getDay() === 0 || date.getDay() === 6);
  const numberClass = isToday ? 'text-[16px] font-extrabold text-accent-700' : 'text-[16px] font-extrabold';
  const fadeClass = faded ? 'opacity-50' : '';

  return (
    <Link
      to={calendarPath('day', date)}
      className={`block border-l border-[color-mix(in_srgb,#201e1d_14%,transparent)] px-1 py-2.5 text-center text-[#201e1d] no-underline hover:text-accent ${fadeClass}`}
    >
      <div className="text-[11px] tracking-wide uppercase opacity-55">{format(date, 'EEE')}</div>
      <div className={numberClass}>{format(date, 'd')}</div>
    </Link>
  );
}
