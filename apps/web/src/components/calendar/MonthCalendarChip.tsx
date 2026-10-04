import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';
import { OccurrenceDoneMark } from './OccurrenceDoneMark';

type MonthCalendarChipProps = {
  occurrence: Occurrence;
  selected: boolean;
  onSelect: (anchor: HTMLElement) => void;
};

export function MonthCalendarChip({ occurrence, selected, onSelect }: MonthCalendarChipProps) {
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';
  const doneTitle = occurrence.completed ? 'line-through' : '';
  const picked = selected ? 'outline outline-2 outline-white' : '';

  return (
    <button
      type="button"
      className={`mt-0.5 flex w-full cursor-pointer items-center gap-0.5 border-0 px-1 text-left text-[11px] leading-4 font-semibold ${textOnColor} ${picked}`}
      style={{ background: occurrence.typeColor }}
      onClick={(event) => onSelect(event.currentTarget)}
    >
      {occurrence.completed ? <OccurrenceDoneMark size={11} /> : null}
      <span className={`truncate ${doneTitle}`}>{line}</span>
    </button>
  );
}
