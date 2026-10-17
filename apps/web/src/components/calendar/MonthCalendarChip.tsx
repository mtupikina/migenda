import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { useScheduleViewing } from '../../hooks/useScheduleViewing';
import { withAssignee } from '../../schedule/assigneeLabeler';
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
  const { assigneeLabel } = useScheduleViewing();
  const line = withAssignee(
    assigneeLabel(occurrence),
    formatEventLine(occurrence.title, occurrence.typeName, occurrence.start),
  );
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'outline outline-2 outline-white' : '';
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (drag.ignoreClick()) {
      return;
    }
    onSelect(event.currentTarget);
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="mt-0.5 h-4" {...listeners} {...attributes}>
        <BookingDragGhost label={originalSlotLabel(occurrence, false)} />
      </div>
    );
  }

  if (occurrence.blocked) {
    const time = format(new Date(occurrence.start), 'HH:mm');
    return (
      <button
        ref={setNodeRef}
        type="button"
        className={`mt-0.5 flex w-full cursor-pointer items-center gap-0.5 border border-[#d4d1cd] bg-[#e4e2df] px-1 text-left text-[11px] leading-4 font-semibold text-[#5c5855] ${picked}`}
        onClick={handleClick}
      >
        <span className="truncate">{time} Blocked</span>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`mt-0.5 flex w-full cursor-grab items-center gap-0.5 border-0 px-1 text-left text-[11px] leading-4 font-semibold ${textOnColor} ${picked}`}
      style={{ background: occurrence.typeColor }}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={11} /> : null}
      <span className={`truncate ${doneTitle}`}>{line}</span>
    </button>
  );
}
