import { blockBox } from '../dashboard/miniCalendarLayout';
import { hourDropTarget } from '../../schedule/calendarDrag';
import { useCalendarDropPreview } from './calendarDragContext';

type CalendarHourDropMarkerProps = {
  day: string;
  hourPx: number;
  insetClass: string;
};

export function CalendarHourDropMarker({ day, hourPx, insetClass }: CalendarHourDropMarkerProps) {
  const preview = useCalendarDropPreview();
  const target = preview ? hourDropTarget(preview.overId) : null;
  if (!preview || !target || target.day !== day) {
    return null;
  }
  const box = blockBox(preview.start, preview.end, hourPx);
  const label = `Drop to move here — ${String(target.hour).padStart(2, '0')}:00`;

  return (
    <div
      className={`pointer-events-none absolute z-20 overflow-hidden border-2 border-dashed border-accent bg-[color-mix(in_srgb,#ec3013_10%,transparent)] ${insetClass}`}
      style={{ top: box.top, height: box.height }}
    >
      <p className="truncate px-2 pt-1 text-[12px] font-semibold text-accent-700">{label}</p>
    </div>
  );
}
