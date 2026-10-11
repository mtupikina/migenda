import { format } from 'date-fns';
import type { KeyboardEvent } from 'react';
import type { Occurrence } from '@migenda/shared';

import { originalSlotLabel } from '../../schedule/calendarDrag';
import { formatEventLine } from '../../schedule/formatEventLine';
import { textOnTypeColor } from '../../schedule/textOnTypeColor';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { BookingDragGhost } from './BookingDragGhost';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { DAY_CALENDAR_HOUR_PX } from './dayCalendarLayout';
import { useBookingDrag } from './useBookingDrag';
import { useCalendarDrag } from './calendarDragContext';

function openLayout(completed: boolean): string {
  if (completed) {
    return 'items-start pt-1.5';
  }
  return 'items-center';
}

function selectFromKeyboard(event: KeyboardEvent<HTMLDivElement>, onSelect: (anchor: HTMLElement) => void) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  event.preventDefault();
  onSelect(event.currentTarget);
}

type DayCalendarBlockProps = {
  occurrence: Occurrence;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function DayCalendarBlock({ occurrence, selected, onSelect }: DayCalendarBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useBookingDrag(occurrence);
  const drag = useCalendarDrag();
  const box = blockBox(occurrence.start, occurrence.end, DAY_CALENDAR_HOUR_PX);
  const time = format(new Date(occurrence.start), 'HH:mm');
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const stacked = box.height >= 44;
  const picked = selected ? 'z-30 outline outline-2 outline-white' : '';
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const frame = {
    top: box.top,
    height: box.height,
  };

  const handleClick = (target: HTMLElement) => {
    if (drag.ignoreClick()) {
      return;
    }
    onSelect(target);
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} className="absolute right-2 left-2 z-10" style={frame} {...listeners} {...attributes}>
        <BookingDragGhost label={originalSlotLabel(occurrence, true)} />
      </div>
    );
  }

  if (occurrence.blocked) {
    const endFmt = format(new Date(occurrence.end), 'HH:mm');
    return (
      <div
        ref={setNodeRef}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        className={`absolute right-2 left-2 z-10 flex cursor-pointer overflow-hidden border border-[#d4d1cd] bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,color-mix(in_srgb,#201e1d_5%,transparent)_8px,color-mix(in_srgb,#201e1d_5%,transparent)_16px)] bg-[#f3f1ee] px-3 py-2 text-[#201e1d] shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_14%,transparent)] ${picked}`}
        style={frame}
        onClick={(event) => handleClick(event.currentTarget)}
        onKeyDown={(event) => selectFromKeyboard(event, onSelect)}
      >
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold">Blocked time</p>
          <p className="truncate text-[12px] opacity-75">
            {time} – {endFmt} {occurrence.reason ? `· ${occurrence.reason}` : ''}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`absolute right-2 left-2 z-10 flex cursor-grab overflow-hidden px-3 shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_28%,transparent)] ${openLayout(occurrence.completed)} ${textOnColor} ${picked}`}
      style={{ ...frame, background: occurrence.typeColor }}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      onClick={(event) => handleClick(event.currentTarget)}
      onKeyDown={(event) => selectFromKeyboard(event, onSelect)}
    >
      <div className="flex min-w-0 items-start gap-1">
        {occurrence.completed ? <OccurrenceDoneMark /> : null}
        <div className="min-w-0 leading-tight">
          <p className={`truncate text-[13px] font-semibold ${doneTitle}`}>{stacked ? occurrence.title : line}</p>
          <p className={stacked ? `truncate text-[12px] opacity-90 ${doneTitle}` : 'hidden'}>
            {occurrence.typeName} · {time}
          </p>
        </div>
      </div>
    </div>
  );
}
