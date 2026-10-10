import type { EventNote } from '@migenda/shared';

import { formatNoteTime } from './noteTime';

type NoteCardProps = {
  note: EventNote;
};

export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className="border border-[color-mix(in_srgb,#201e1d_28%,transparent)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold">{note.authorName}</span>
        <span className="text-xs opacity-[0.55]">{formatNoteTime(note.createdAt)}</span>
      </div>
      <p className="m-0 text-sm opacity-[0.85]">{note.text}</p>
    </div>
  );
}
