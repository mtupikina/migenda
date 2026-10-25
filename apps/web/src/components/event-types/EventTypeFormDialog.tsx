import { Modal } from '@mantine/core';
import type { ManagedEventType } from '@migenda/shared';

import { EventTypeForm } from './EventTypeForm';

type EventTypeFormDialogProps = {
  opened: boolean;
  type: ManagedEventType | null;
  onClose: () => void;
};

export function EventTypeFormDialog({ opened, type, onClose }: EventTypeFormDialogProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={type ? 'Edit type' : 'New type'}
      centered
      size={560}
      radius={0}
      yOffset="3dvh"
    >
      {opened ? <EventTypeForm key={type?.id ?? 'new'} type={type} onSaved={onClose} onCancel={onClose} /> : null}
    </Modal>
  );
}
