import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Occurrence } from '@migenda/shared';

import { calendarPath } from '../../calendarPeriod';
import { dayKey, occurrencesOn } from '../../dashboardDays';
import { MonthCalendarChip } from './MonthCalendarChip';
import { MonthCalendarMore } from './MonthCalendarMore';
import { MONTH_CALENDAR_CHIP_LIMIT, monthCellFrameClass } from './monthCalendarLayout';
import { occurrenceKey, useBookingSelection } from './useBookingActions';

type MonthCalendarCellProps = {
  date: Date;
  month: Date;
  occurrences: Occurrence[];
  index: number;
  selected: boolean;
  onSelect: () => void;
  onClearSlot: () => void;
};

export function MonthCalendarCell({
  date,
  month,
  occurrences,
  index,
  selected,
  onSelect,
  onClearSlot,
}: MonthCalendarCellProps) {
  const booking = useBookingSelection();
  const events = occurrencesOn(occurrences, dayKey(date));
  const visible = events.slice(0, MONTH_CALENDAR_CHIP_LIMIT);
  const outside = format(date, 'yyyy-MM') !== format(month, 'yyyy-MM');
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const isToday = dayKey(date) === dayKey(new Date());
  const faded = outside && !isToday;
  const weekendTint = weekend ? 'bg-[color-mix(in_srgb,#201e1d_4%,transparent)]' : '';
  const tint = selected ? 'bg-[color-mix(in_srgb,#ec3013_18%,transparent)]' : weekendTint;
  const hover = selected ? '' : 'hover:bg-[color-mix(in_srgb,#ec3013_12%,transparent)]';
  const fade = faded ? 'opacity-50' : '';
  const numberClass = isToday
    ? 'text-[16px] font-extrabold text-accent-700'
    : 'text-[16px] font-extrabold text-[#201e1d]';

  return (
    <div className={`relative min-h-[92px] p-1 ${monthCellFrameClass(index)} ${tint} ${fade}`}>
      <button
        type="button"
        aria-label={format(date, 'EEEE, MMMM d')}
        className={`absolute inset-0 cursor-pointer border-0 bg-transparent p-0 ${hover}`}
        onClick={onSelect}
      />
      <div className="relative z-10">
        <Link to={calendarPath('day', date)} className={`mb-1 block no-underline hover:text-accent ${numberClass}`}>
          {format(date, 'd')}
        </Link>
        {visible.map((occurrence) => {
          const key = occurrenceKey(occurrence);
          const picked = key === booking.selectedKey;
          return (
            <MonthCalendarChip
              key={key}
              occurrence={occurrence}
              selected={picked}
              onSelect={(anchor) => {
                onClearSlot();
                booking.select(key, anchor);
              }}
            />
          );
        })}
        <MonthCalendarMore count={events.length - visible.length} date={date} />
      </div>
    </div>
  );
}
