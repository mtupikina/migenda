import { GripVertical } from 'lucide-react';
import type { Occurrence } from '@migenda/shared';

import { textOnTypeColor } from '../../schedule/textOnTypeColor';

type CalendarDragOverlayProps = {
  occurrence: Occurrence;
};

export function CalendarDragOverlay({ occurrence }: CalendarDragOverlayProps) {
  const textOnColor = textOnTypeColor(occurrence.typeColor);

  return (
    <div
      className={`flex w-[240px] -rotate-[2.5deg] cursor-grabbing items-center gap-2 px-3 py-2 shadow-[0_12px_32px_color-mix(in_srgb,#2d2b2b_22%,transparent)] ${textOnColor}`}
      style={{ background: occurrence.typeColor }}
    >
      <GripVertical size={14} strokeWidth={2} aria-hidden className="shrink-0 opacity-70" />
      <span className="truncate text-[13px] font-semibold">{occurrence.title}</span>
    </div>
  );
}
