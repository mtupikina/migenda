import type { Occurrence } from '@migenda/shared';
import { Circle, CircleCheck } from 'lucide-react';

import { formatEventLine } from '../../formatEventLine';

type DashboardChecklistItemProps = {
  occurrence: Occurrence;
};

export function DashboardChecklistItem({ occurrence }: DashboardChecklistItemProps) {
  const line = formatEventLine(occurrence.title, occurrence.typeName, occurrence.start);
  const done = occurrence.completed;

  return (
    <div
      className="flex min-w-0 items-center gap-2.5 border-l-[3px] pl-2.5"
      style={{ borderLeftColor: occurrence.typeColor }}
    >
      {done ? (
        <CircleCheck size={18} className="shrink-0 text-accent" aria-hidden="true" />
      ) : (
        <Circle
          size={18}
          className="shrink-0 text-[color-mix(in_srgb,#201e1d_40%,transparent)]"
          aria-hidden="true"
        />
      )}
      <span className={done ? 'min-w-0 truncate text-sm' : 'min-w-0 truncate text-sm opacity-80'}>{line}</span>
    </div>
  );
}
