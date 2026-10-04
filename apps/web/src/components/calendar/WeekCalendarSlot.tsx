import { format } from 'date-fns';

type WeekCalendarSlotProps = {
  date: Date;
  hour: number;
  selected: boolean;
  onSelect: (hour: number) => void;
};

export function WeekCalendarSlot({ date, hour, selected, onSelect }: WeekCalendarSlotProps) {
  const fill = selected
    ? 'bg-[color-mix(in_srgb,#ec3013_18%,transparent)]'
    : 'bg-transparent hover:bg-[color-mix(in_srgb,#ec3013_12%,transparent)]';
  const time = `${String(hour).padStart(2, '0')}:00`;

  return (
    <button
      type="button"
      aria-label={`${format(date, 'EEEE, MMMM d')}, ${time}`}
      className={`block h-10 w-full cursor-pointer border-x-0 border-b-0 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)] p-0 ${fill}`}
      onClick={() => onSelect(hour)}
    />
  );
}
