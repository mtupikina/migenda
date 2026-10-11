import { useEffect, useState } from 'react';
import { Loader, Modal, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import type { AssigneeOption, EventType } from '@migenda/shared';

import { fetchEvent } from '../../api/events';
import { eventToFormValues } from '../../schedule/newEventForm';
import { CreateEventTypeForm } from './CreateEventTypeForm';
import { NewEventForm } from './NewEventForm';

type NewEventDialogProps = {
  opened: boolean;
  types: EventType[];
  assignees: AssigneeOption[];
  initialRange?: { start: string; end: string } | null;
  eventId?: string | null;
  occurrenceStart?: string | null;
  onClose: () => void;
  onSaved?: (warning?: string) => void;
};

export function NewEventDialog({
  opened,
  types,
  assignees,
  initialRange,
  eventId = null,
  occurrenceStart = null,
  onClose,
  onSaved,
}: NewEventDialogProps) {
  const [creatingType, setCreatingType] = useState(false);
  const [typeId, setTypeId] = useState<string | null>(null);
  const editing = Boolean(eventId);
  const eventQuery = useQuery({
    queryKey: ['event', eventId, occurrenceStart],
    queryFn: () => {
      if (!eventId) {
        throw new Error('Missing event');
      }
      return fetchEvent(eventId, occurrenceStart);
    },
    enabled: opened && editing,
  });
  const waitingForFirstType = types.length === 0 && typeId === null;
  const showTypeForm = creatingType || waitingForFirstType;
  const saved = eventQuery.data ?? null;
  const formValues = saved ? eventToFormValues(saved, typeId) : null;
  const eventTitle = editing ? 'Edit event' : 'New event';
  const title = showTypeForm ? 'New type' : eventTitle;
  const showLoader = editing && !showTypeForm && eventQuery.isLoading;
  const showLoadError = editing && !showTypeForm && eventQuery.isError;
  const showEventForm = !showTypeForm && (!editing || formValues !== null);
  const formKey = editing
    ? `${eventId}-${occurrenceStart ?? 'series'}-${saved?.start ?? 'loading'}-${saved?.end ?? 'loading'}-${typeId ?? formValues?.typeId ?? 'saved'}`
    : `${typeId ?? 'event'}-${initialRange?.start ?? 'now'}`;

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
      title={title}
      centered
      size={560}
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
      ) : null}
      {showLoader ? <Loader color="accent" /> : null}
      {showLoadError ? <Text c="accent.7">Could not load this event.</Text> : null}
      {showEventForm ? (
        <NewEventForm
          key={formKey}
          types={types}
          assignees={assignees}
          initialTypeId={typeId}
          initialRange={initialRange}
          eventId={eventId}
          occurrenceStart={occurrenceStart}
          repeating={Boolean(saved && saved.weekdays.length > 0)}
          values={formValues}
          onCreateType={() => setCreatingType(true)}
          onCreated={(warning) => {
            onSaved?.(warning);
            onClose();
          }}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
