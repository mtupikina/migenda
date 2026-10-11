import type { Occurrence } from '@migenda/shared';

import { originalSlotLabel } from '../../schedule/calendarDrag';
import { formatEventLine } from '../../schedule/formatEventLine';
import { textOnTypeColor } from '../../schedule/textOnTypeColor';
import { BookingDragGhost } from './BookingDragGhost';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { useBookingDrag } from './useBookingDrag';
import { useCalendarDrag } from './calendarDragContext';

type MonthCalendarChipProps = {
  occurrence: Occurrence;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function MonthCalendarChip({ occurrence, selected, onSelect }: MonthCalendarChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useBookingDrag(occurrence);
  const drag = useCalendarDrag();
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'outline outline-2 outline-white' : '';

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="mt-0.5 h-4" {...listeners} {...attributes}>
        <BookingDragGhost label={originalSlotLabel(occurrence, false)} />
      </div>
    );
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`mt-0.5 flex w-full cursor-grab items-center gap-0.5 border-0 px-1 text-left text-[11px] leading-4 font-semibold ${textOnColor} ${picked}`}
      style={{ background: occurrence.typeColor }}
      onClick={(event) => {
        event.stopPropagation();
        if (drag.ignoreClick()) {
          return;
        }
        onSelect(event.currentTarget);
      }}
      {...listeners}
      {...attributes}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={11} /> : null}
      <span className={`truncate ${doneTitle}`}>{line}</span>
    </button>
  );
}
