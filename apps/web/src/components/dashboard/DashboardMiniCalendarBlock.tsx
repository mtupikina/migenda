import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { OccurrenceDoneMark } from '../calendar/OccurrenceDoneMark';
import { formatEventLine } from '../../formatEventLine';
import { blockBox, MINI_CALENDAR_HOUR_PX } from './miniCalendarLayout';

type DashboardMiniCalendarBlockProps = {
  occurrence: Occurrence;
};

export function DashboardMiniCalendarBlock({ occurrence }: DashboardMiniCalendarBlockProps) {
  const box = blockBox(occurrence.start, occurrence.end, MINI_CALENDAR_HOUR_PX);
  const time = format(new Date(occurrence.start), 'HH:mm');
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';
  const stacked = box.height >= 36;
  const doneTitle = occurrence.completed ? 'line-through' : '';

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
