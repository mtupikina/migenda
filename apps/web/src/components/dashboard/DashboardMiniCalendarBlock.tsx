import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { OccurrenceDoneMark } from '../calendar/OccurrenceDoneMark';
import { formatEventLine } from '../../schedule/formatEventLine';
import { textOnTypeColor } from '../../schedule/textOnTypeColor';
import { blockBox, MINI_CALENDAR_HOUR_PX } from './miniCalendarLayout';

type DashboardMiniCalendarBlockProps = {
  occurrence: Occurrence;
};

export function DashboardMiniCalendarBlock({ occurrence }: DashboardMiniCalendarBlockProps) {
  const box = blockBox(occurrence.start, occurrence.end, MINI_CALENDAR_HOUR_PX);
  const time = format(new Date(occurrence.start), 'HH:mm');
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const textOnColor = textOnTypeColor(occurrence.typeColor);
  const stacked = box.height >= 36;
  const doneTitle = occurrence.completed ? 'line-through' : '';

  if (occurrence.blocked) {
    return (
      <div
        className="absolute right-1 left-1 z-10 flex items-center gap-1 overflow-hidden border border-[#d4d1cd] bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,color-mix(in_srgb,#201e1d_5%,transparent)_6px,color-mix(in_srgb,#201e1d_5%,transparent)_12px)] bg-[#f3f1ee] px-2 text-[#5c5855] shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_14%,transparent)]"
        style={{ top: box.top, height: box.height }}
      >
        <p className="truncate text-[11px] font-semibold">Blocked</p>
      </div>
    );
  }

  return (
    <div
      className={`absolute right-1 left-1 z-10 flex items-center gap-1 overflow-hidden px-2 shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_28%,transparent)] ${textOnColor}`}
      style={{ top: box.top, height: box.height, background: occurrence.typeColor }}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={12} /> : null}
      <div className="min-w-0 leading-tight">
        <p className={`truncate text-[12px] font-semibold ${doneTitle}`}>{stacked ? occurrence.title : line}</p>
        <p className={stacked ? `truncate text-[10px] opacity-90 ${doneTitle}` : 'hidden'}>
          {occurrence.typeName} · {time}
        </p>
      </div>
    </div>
  );
}
