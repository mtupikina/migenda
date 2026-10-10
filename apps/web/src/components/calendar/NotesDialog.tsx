import { format } from 'date-fns';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { File } from 'lucide-react';
import type { Occurrence } from '@migenda/shared';

type NotesDialogProps = {
  occurrence: Occurrence | null;
  onClose: () => void;
};

export function NotesDialog({ occurrence, onClose }: NotesDialogProps) {
  const title = occurrence
    ? `Note — ${occurrence.title}, ${format(new Date(occurrence.start), 'HH:mm')}`
    : 'Note';

  return (
    <Modal opened={occurrence !== null} onClose={onClose} title={title} centered radius={0}>
      {occurrence ? (
        <Stack gap={16}>
          <Stack align="center" gap={12} className="py-6">
            <File size={44} strokeWidth={1.5} aria-hidden className="text-[#201e1d] opacity-30" />
            <Text fz={14} ta="center" className="max-w-[34ch] opacity-[0.65]">
              No notes yet for this time slot. Add one to keep context alongside the event.
            </Text>
          </Stack>
          <Group justify="flex-end" gap={8}>
            <Button type="button" variant="default" onClick={onClose}>
              Close
            </Button>
            <Button type="button">Add note</Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
}
