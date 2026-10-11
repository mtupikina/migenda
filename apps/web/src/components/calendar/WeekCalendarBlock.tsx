import type { Occurrence } from '@migenda/shared';

import { originalSlotLabel } from '../../schedule/calendarDrag';
import { formatEventLine } from '../../schedule/formatEventLine';
import { textOnTypeColor } from '../../schedule/textOnTypeColor';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { BookingDragGhost } from './BookingDragGhost';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { useBookingDrag } from './useBookingDrag';
import { useCalendarDrag } from './calendarDragContext';
import { WEEK_CALENDAR_HOUR_PX } from './weekCalendarLayout';

type WeekCalendarBlockProps = {
  occurrence: Occurrence;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function WeekCalendarBlock({ occurrence, selected, onSelect }: WeekCalendarBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useBookingDrag(occurrence);
  const drag = useCalendarDrag();
  const box = blockBox(occurrence.start, occurrence.end, WEEK_CALENDAR_HOUR_PX);
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'z-30 outline outline-2 outline-white' : '';
  const frame = { top: box.top, height: box.height };

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="absolute right-1 left-1 z-10" style={frame} {...listeners} {...attributes}>
        <BookingDragGhost label={originalSlotLabel(occurrence, true)} />
      </div>
    );
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`absolute right-1 left-1 z-10 flex cursor-grab items-center gap-1 overflow-hidden border-0 px-1.5 text-left ${textOnColor} ${picked}`}
      style={{ ...frame, background: occurrence.typeColor }}
      onClick={(event) => {
        if (drag.ignoreClick()) {
          return;
        }
        onSelect(event.currentTarget);
      }}
      {...listeners}
      {...attributes}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={12} /> : null}
      <p className={`truncate text-[11px] leading-tight font-semibold ${doneTitle}`}>{line}</p>
    </button>
  );
}
