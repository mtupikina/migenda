import { format } from 'date-fns';
import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { DAY_CALENDAR_HOUR_PX } from './dayCalendarLayout';

type DayCalendarBlockProps = {
  occurrence: Occurrence;
};

export function DayCalendarBlock({ occurrence }: DayCalendarBlockProps) {
  const box = blockBox(occurrence.start, occurrence.end, DAY_CALENDAR_HOUR_PX);
  const time = format(new Date(occurrence.start), 'HH:mm');
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';
  const stacked = box.height >= 44;

  return (
    <div
      className={`absolute right-2 left-2 z-10 flex items-center overflow-hidden px-3 shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_28%,transparent)] ${textOnColor}`}
      style={{ top: box.top, height: box.height, background: occurrence.typeColor }}
    >
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-semibold">{stacked ? occurrence.title : line}</p>
        <p className={stacked ? 'truncate text-[12px] opacity-90' : 'hidden'}>
          {occurrence.typeName} · {time}
        </p>
      </div>
    </div>
  );
}
