import { useState } from 'react';
import { Box, Button, Group, Loader, Stack, Text, Title } from '@mantine/core';
import type { ManagedEventType } from '@migenda/shared';

import { AppNav } from '../components/AppNav';
import { DeleteEventTypeDialog } from '../components/event-types/DeleteEventTypeDialog';
import { EventTypeFormDialog } from '../components/event-types/EventTypeFormDialog';
import { EventTypesEmpty } from '../components/event-types/EventTypesEmpty';
import { EventTypesList } from '../components/event-types/EventTypesList';
import { useEventTypes } from '../hooks/useEventTypes';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function EventTypesPage() {
  const { data: user, isLoading } = useRequireAuth();
  const eventTypes = useEventTypes(Boolean(user));
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ManagedEventType | null>(null);
  const [deleting, setDeleting] = useState<ManagedEventType | null>(null);
  const types = eventTypes.data ?? [];
  const waiting = isLoading || !user || eventTypes.isLoading;
  const openCreate = () => {
    setEditing(null);
    setCreating(true);
  };

  return (
    <Box mih="100vh">
      <AppNav />
      <Box maw={760} mx="auto" px={{ base: 20, sm: 72 }} py={70}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap={16} mb={32}>
          <Stack gap={4}>
            <Title order={1} fz={28} fw={800} lh={1.1}>
              Event types
            </Title>
            <Text fz={14} className="opacity-65">
              Names and colors you assign to events.
            </Text>
          </Stack>
          <Button onClick={openCreate}>Add type</Button>
        </Group>
        {waiting ? <Loader color="accent" /> : null}
        {eventTypes.isError ? <Text>Could not load your event types.</Text> : null}
        {eventTypes.isSuccess && types.length === 0 ? <EventTypesEmpty onAdd={openCreate} /> : null}
        {eventTypes.isSuccess && types.length > 0 ? (
          <EventTypesList types={types} onEdit={setEditing} onDelete={setDeleting} />
        ) : null}
      </Box>
      <EventTypeFormDialog
        opened={creating || editing !== null}
        type={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />
      {deleting ? <DeleteEventTypeDialog type={deleting} onClose={() => setDeleting(null)} /> : null}
    </Box>
  );
}
