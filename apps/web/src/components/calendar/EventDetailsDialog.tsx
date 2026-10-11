import type { ReactNode } from 'react';
import { Modal } from '@mantine/core';
import type { AssigneeOption, EventType, Occurrence } from '@migenda/shared';

import { EventDetailsContent } from './EventDetailsContent';

type EventDetailsDialogProps = {
  opened: boolean;
  occurrence: Occurrence | null;
  types: EventType[];
  assignees: AssigneeOption[];
  scrollToNotes?: boolean;
  children?: ReactNode;
  onClose: () => void;
};

export function EventDetailsDialog({
  opened,
  occurrence,
  types,
  assignees,
  scrollToNotes = false,
  children,
  onClose,
}: EventDetailsDialogProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Event details"
      centered
      size={560}
      radius={0}
      classNames={{ body: 'max-h-[70vh] overflow-y-auto' }}
    >
      {occurrence ? (
        <EventDetailsContent
          occurrence={occurrence}
          types={types}
          assignees={assignees}
          scrollToNotes={scrollToNotes}
        />
      ) : (
        children
      )}
    </Modal>
  );
}
