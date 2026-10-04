import { format } from 'date-fns';
import type { KeyboardEvent } from 'react';
import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';
import { blockBox } from '../dashboard/miniCalendarLayout';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';
import { DAY_CALENDAR_HOUR_PX } from './dayCalendarLayout';

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
  const box = blockBox(occurrence.start, occurrence.end, DAY_CALENDAR_HOUR_PX);
  const time = format(new Date(occurrence.start), 'HH:mm');
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';
  const stacked = box.height >= 44;
  const picked = selected ? 'z-30 outline outline-2 outline-white' : '';
  const doneTitle = occurrence.completed ? 'line-through' : '';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={`absolute right-2 left-2 z-10 flex cursor-pointer overflow-hidden px-3 shadow-[0_1px_2px_color-mix(in_srgb,#2d2b2b_28%,transparent)] ${openLayout(occurrence.completed)} ${textOnColor} ${picked}`}
      style={{ top: box.top, height: box.height, background: occurrence.typeColor }}
      onClick={(event) => onSelect(event.currentTarget)}
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
