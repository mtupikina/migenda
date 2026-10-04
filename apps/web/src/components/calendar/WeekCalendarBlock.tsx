import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { WEEK_CALENDAR_HOUR_PX } from './weekCalendarLayout';

type WeekCalendarBlockProps = {
  occurrence: Occurrence;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function WeekCalendarBlock({ occurrence, selected, onSelect }: WeekCalendarBlockProps) {
  const box = blockBox(occurrence.start, occurrence.end, WEEK_CALENDAR_HOUR_PX);
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'z-30 outline outline-2 outline-white' : '';

  return (
    <button
      type="button"
      className={`absolute right-1 left-1 z-10 flex cursor-pointer items-center gap-1 overflow-hidden border-0 px-1.5 text-left ${textOnColor} ${picked}`}
      style={{ top: box.top, height: box.height, background: occurrence.typeColor }}
      onClick={(event) => onSelect(event.currentTarget)}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={12} /> : null}
      <p className={`truncate text-[11px] leading-tight font-semibold ${doneTitle}`}>{line}</p>
    </button>
  );
}
