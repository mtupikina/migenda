import type { Occurrence } from '@migenda/shared';

import { formatEventLine } from '../../formatEventLine';

type MonthCalendarChipProps = {
  occurrence: Occurrence;
};

export function MonthCalendarChip({ occurrence }: MonthCalendarChipProps) {
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const lightness = Number(occurrence.typeColor.match(/oklch\(\s*([\d.]+)/)?.[1] ?? 0);
  const textOnColor = lightness > 0.72 ? 'text-[#201e1d]' : 'text-white';

  return (
    <p
      className={`mt-0.5 truncate px-1 text-[11px] leading-4 font-semibold ${textOnColor}`}
      style={{ background: occurrence.typeColor }}
    >
      {line}
    </p>
  );
}
