import type { Occurrence } from '@migenda/shared';

type DayCalendarLegendProps = {
  occurrences: Occurrence[];
};

export function DayCalendarLegend({ occurrences }: DayCalendarLegendProps) {
  const types = new Map<string, string>();
  for (const occurrence of occurrences) {
    if (types.has(occurrence.typeName)) {
      continue;
    }
    types.set(occurrence.typeName, occurrence.typeColor);
  }
  if (types.size === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-6 text-[12px]">
      {[...types.entries()].map(([name, color]) => (
        <span key={name} className="flex items-center gap-1.5">
          <span className="size-2.5" style={{ background: color }} />
          {name}
        </span>
      ))}
    </div>
  );
}
