import type { Occurrence } from '@migenda/shared';

import { useScheduleViewing } from '../../hooks/useScheduleViewing';
import { withAssignee } from '../../schedule/assigneeLabeler';
import { originalSlotLabel } from '../../schedule/calendarDrag';
import { formatEventLine } from '../../schedule/formatEventLine';
import { laneFrame } from '../../schedule/laneFrame';
import type { Lane } from '../../schedule/overlapLanes';
import { textOnTypeColor } from '../../schedule/textOnTypeColor';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { BookingDragGhost } from './BookingDragGhost';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { useBookingDrag } from './useBookingDrag';
import { useCalendarDrag } from './calendarDragContext';
import { WEEK_CALENDAR_HOUR_PX } from './weekCalendarLayout';

type WeekCalendarBlockProps = {
  occurrence: Occurrence;
  lane: Lane;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function WeekCalendarBlock({ occurrence, lane, selected, onSelect }: WeekCalendarBlockProps) {
  const { assigneeLabel } = useScheduleViewing();
  const { attributes, listeners, setNodeRef, isDragging } = useBookingDrag(occurrence);
  const drag = useCalendarDrag();
  const box = blockBox(occurrence.start, occurrence.end, WEEK_CALENDAR_HOUR_PX);
  const line = withAssignee(
    assigneeLabel(occurrence),
    formatEventLine(occurrence.title, occurrence.typeName, occurrence.start),
  );
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'z-30 outline outline-2 outline-white' : '';
  const frame = { top: box.top, height: box.height, ...laneFrame(lane, 4) };
  const handleClick = (target: HTMLElement) => {
    if (drag.ignoreClick()) {
      return;
    }
    onSelect(target);
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="absolute z-10" style={frame} {...listeners} {...attributes}>
        <BookingDragGhost label={originalSlotLabel(occurrence, true)} />
      </div>
    );
  }

  if (occurrence.blocked) {
    return (
      <button
        ref={setNodeRef}
        type="button"
        className={`absolute z-10 flex cursor-pointer items-center gap-1 overflow-hidden border border-[#d4d1cd] bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,color-mix(in_srgb,#201e1d_5%,transparent)_6px,color-mix(in_srgb,#201e1d_5%,transparent)_12px)] bg-[#f3f1ee] px-1.5 text-left text-[#201e1d] ${picked}`}
        style={frame}
        onClick={(event) => handleClick(event.currentTarget)}
      >
        <p className="truncate text-[11px] leading-tight font-semibold">Blocked</p>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`absolute z-10 flex cursor-grab items-center gap-1 overflow-hidden border-0 px-1.5 text-left ${textOnColor} ${picked}`}
      style={{ ...frame, background: occurrence.typeColor }}
      onClick={(event) => handleClick(event.currentTarget)}
      {...listeners}
      {...attributes}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={12} /> : null}
      <p className={`truncate text-[11px] leading-tight font-semibold ${doneTitle}`}>{line}</p>
    </button>
  );
}
