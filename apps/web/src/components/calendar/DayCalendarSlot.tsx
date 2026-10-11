import { useDroppable } from '@dnd-kit/core';

import { hourDropId } from '../../schedule/calendarDrag';

type DayCalendarSlotProps = {
  day: string;
  hour: number;
  selected: boolean;
  onSelect: (hour: number) => void;
};

export function DayCalendarSlot({ day, hour, selected, onSelect }: DayCalendarSlotProps) {
  const { setNodeRef } = useDroppable({ id: hourDropId(day, hour) });
  const fill = selected
    ? 'bg-[color-mix(in_srgb,#ec3013_18%,transparent)]'
    : 'bg-transparent hover:bg-[color-mix(in_srgb,#ec3013_12%,transparent)]';
  const label = `${String(hour).padStart(2, '0')}:00`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={label}
      className={`block h-16 w-full cursor-pointer border-x-0 border-b-0 border-t border-[color-mix(in_srgb,#201e1d_14%,transparent)] p-0 ${fill}`}
      onClick={() => onSelect(hour)}
    />
  );
}
