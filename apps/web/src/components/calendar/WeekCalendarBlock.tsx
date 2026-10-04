import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { WEEK_CALENDAR_HOUR_PX } from './weekCalendarLayout';

type WeekCalendarBlockProps = {
  occurrence: Occurrence;
};

export function WeekCalendarBlock({ occurrence }: WeekCalendarBlockProps) {
  const box = blockBox(occurrence.start, occurrence.end, WEEK_CALENDAR_HOUR_PX);
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';

  return (
    <div
      className={`absolute right-1 left-1 z-10 flex items-center overflow-hidden px-1.5 ${textOnColor}`}
      style={{ top: box.top, height: box.height, background: occurrence.typeColor }}
    >
      <p className="truncate text-[11px] leading-tight font-semibold">{line}</p>
    </div>
  );
}
