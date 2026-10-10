import { format } from 'date-fns';
import { Modal, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { File } from 'lucide-react';
import type { Occurrence } from '@migenda/shared';

import { fetchNotes } from '../../api/events';
import { NoteCard } from './NoteCard';
import { NoteComposeForm } from './NoteComposeForm';

type NotesDialogProps = {
  occurrence: Occurrence | null;
  onClose: () => void;
};

export function NotesDialog({ occurrence, onClose }: NotesDialogProps) {
  const notes = useQuery({
    queryKey: ['notes', occurrence?.eventId, occurrence?.start],
    queryFn: () => {
      if (!occurrence) {
        throw new Error('Missing event');
      }
      return fetchNotes(occurrence.eventId, occurrence.start);
    },
    enabled: occurrence !== null,
  });
  const title = occurrence
    ? `Note — ${occurrence.title}, ${format(new Date(occurrence.start), 'HH:mm')}`
    : 'Note';
  const items = notes.data ?? [];
  const showEmpty = notes.isSuccess && items.length === 0;

  return (
    <Modal
      opened={occurrence !== null}
      onClose={onClose}
      title={title}
      centered
      radius={0}
      classNames={{ body: 'max-h-[70vh] overflow-y-auto' }}
    >
      {occurrence ? (
        <Stack gap={16}>
          {showEmpty ? (
            <Stack align="center" gap={12} className="py-6">
              <File size={44} strokeWidth={1.5} aria-hidden className="text-[#201e1d] opacity-30" />
              <Text fz={14} ta="center" className="max-w-[34ch] opacity-[0.65]">
                No notes yet for this time slot. Add one to keep context alongside the event.
              </Text>
            </Stack>
          ) : null}
          {items.length > 0 ? (
            <Stack gap={16}>
              {items.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </Stack>
          ) : null}
          {notes.isError ? <Text fz={13}>Could not load notes.</Text> : null}
          <NoteComposeForm
            key={`${occurrence.eventId}-${occurrence.start}`}
            eventId={occurrence.eventId}
            occurrenceStart={occurrence.start}
            onClose={onClose}
          />
        </Stack>
      ) : null}
    </Modal>
  );
}
