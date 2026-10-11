import { useEffect, useRef } from 'react';
import { Stack, Text } from '@mantine/core';
import type { EventNote } from '@migenda/shared';

import { NoteCard } from './NoteCard';

type EventDetailsNotesProps = {
  notes: EventNote[];
  loading: boolean;
  failed: boolean;
  scrollToNotes: boolean;
};

export function EventDetailsNotes({ notes, loading, failed, scrollToNotes }: EventDetailsNotesProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!scrollToNotes || loading) {
      return;
    }
    heading.current?.scrollIntoView({ block: 'start' });
  }, [loading, scrollToNotes]);

  return (
    <Stack gap={12}>
      <h2 ref={heading} className="m-0 text-[16px] font-extrabold">
        Notes
      </h2>
      {loading ? <Text fz={13}>Loading notes…</Text> : null}
      {failed ? <Text fz={13}>Could not load notes.</Text> : null}
      {!loading && !failed && notes.length === 0 ? (
        <Text fz={14} className="opacity-[0.65]">
          No notes yet for this time slot.
        </Text>
      ) : null}
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </Stack>
  );
}
