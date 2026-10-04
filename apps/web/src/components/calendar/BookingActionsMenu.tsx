import { Copy, FileText } from 'lucide-react';
import type { Occurrence } from '@migenda/shared';

type BookingActionsMenuProps = {
  occurrence: Occurrence;
  completing: boolean;
  duplicating: boolean;
  toast: string | null;
  onComplete: () => void;
  onDuplicate: () => void;
};

export function BookingActionsMenu({
  occurrence,
  completing,
  duplicating,
  toast,
  onComplete,
  onDuplicate,
}: BookingActionsMenuProps) {
  const completeLabel = occurrence.completed ? 'Completed' : 'Complete';

  return (
    <div className="flex flex-col gap-2 text-[#201e1d]">
      <div className="flex items-center justify-between gap-3">
        <button type="button" aria-label="Add note" className={iconClass}>
          <FileText size={14} />
        </button>
        <button
          type="button"
          aria-label="Duplicate to next day"
          title="Create a time slot duplicate for tomorrow"
          className={iconClass}
          disabled={duplicating}
          onClick={onDuplicate}
        >
          <Copy size={14} />
        </button>
      </div>
      <div className="flex gap-1.5">
        <button type="button" className={outlineClass}>
          Edit
        </button>
        <button
          type="button"
          className={`${outlineClass} disabled:cursor-default disabled:opacity-70`}
          disabled={occurrence.completed || completing}
          onClick={onComplete}
        >
          {completeLabel}
        </button>
        <button type="button" className="border border-accent bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
          Remove
        </button>
      </div>
      {toast ? <p className="text-[11px] font-semibold text-accent-700">{toast}</p> : null}
    </div>
  );
}

const iconClass =
  'inline-flex cursor-pointer border-0 bg-transparent p-0.5 text-[#201e1d] disabled:cursor-default';

const outlineClass = 'border border-[#201e1d] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#201e1d]';
