import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import type { ManagedEventType } from '@migenda/shared';

import { profileCardClassName } from '../../classNames/shared';

type EventTypesListProps = {
  types: ManagedEventType[];
  onEdit: (type: ManagedEventType) => void;
  onDelete: (type: ManagedEventType) => void;
};

export function EventTypesList({ types, onEdit, onDelete }: EventTypesListProps) {
  return (
    <Stack gap={12}>
      {types.map((type) => (
        <Paper key={type.id} p={16} className={profileCardClassName}>
          <Group justify="space-between" wrap="nowrap" gap={16}>
            <Group gap={12} wrap="nowrap">
              <span
                aria-hidden
                title={type.name}
                className="inline-block h-8 w-8 shrink-0 rounded-full border border-[color-mix(in_srgb,#201e1d_20%,transparent)]"
                style={{ background: type.color }}
              />
              <Text fz={14} fw={600} lh={1.3}>
                {type.name}
              </Text>
            </Group>
            <Group gap={12} wrap="nowrap">
              {type.inUse ? (
                <Text fz={12} className="whitespace-nowrap opacity-60">
                  Used on events
                </Text>
              ) : (
                <Button type="button" size="xs" variant="default" onClick={() => onDelete(type)}>
                  Delete
                </Button>
              )}
              <Button type="button" size="xs" variant="default" onClick={() => onEdit(type)}>
                Edit
              </Button>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
