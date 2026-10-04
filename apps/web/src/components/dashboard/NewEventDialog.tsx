import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import type { AssigneeOption, EventType } from '@migenda/shared';

import { CreateEventTypeForm } from './CreateEventTypeForm';
import { NewEventForm } from './NewEventForm';

type NewEventDialogProps = {
  opened: boolean;
  types: EventType[];
  assignees: AssigneeOption[];
  initialRange?: { start: string; end: string } | null;
  onClose: () => void;
};

export function NewEventDialog({
  opened,
  types,
  assignees,
  initialRange,
  onClose,
}: NewEventDialogProps) {
  const [creatingType, setCreatingType] = useState(false);
  const [typeId, setTypeId] = useState<string | null>(null);
  const waitingForFirstType = types.length === 0 && typeId === null;
  const showTypeForm = creatingType || waitingForFirstType;

  useEffect(() => {
    if (opened) {
      return;
    }
    setCreatingType(false);
    setTypeId(null);
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={showTypeForm ? 'New type' : 'New event'}
      centered
      radius={0}
      classNames={{ body: 'max-h-[70vh] overflow-y-auto' }}
    >
      {showTypeForm ? (
        <CreateEventTypeForm
          onCreated={(id) => {
            setTypeId(id);
            setCreatingType(false);
          }}
          onCancel={() => {
            if (waitingForFirstType) {
              onClose();
              return;
            }
            setCreatingType(false);
          }}
        />
      ) : (
        <NewEventForm
          key={`${typeId ?? 'event'}-${initialRange?.start ?? 'now'}`}
          types={types}
          assignees={assignees}
          initialTypeId={typeId}
          initialRange={initialRange}
          onCreateType={() => setCreatingType(true)}
          onCreated={onClose}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
