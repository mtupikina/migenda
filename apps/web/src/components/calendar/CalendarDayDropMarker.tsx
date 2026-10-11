import { format } from 'date-fns';

type CalendarDayDropMarkerProps = {
  date: Date;
};

export function CalendarDayDropMarker({ date }: CalendarDayDropMarkerProps) {
  return (
    <p className="truncate text-[11px] font-semibold text-accent-700">Drop to move here — {format(date, 'MMM d')}</p>
  );
}
