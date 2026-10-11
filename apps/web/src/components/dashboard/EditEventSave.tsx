import { Button, Group } from '@mantine/core';
import type { DeleteEventScope } from '@migenda/shared';

type EditEventSaveProps = {
  editing: boolean;
  repeating: boolean;
  pending: DeleteEventScope | 'create' | null;
  onCancel: () => void;
  onSave: (scope: DeleteEventScope | null) => void;
};

export function EditEventSave({ editing, repeating, pending, onCancel, onSave }: EditEventSaveProps) {
  const saving = pending !== null;
  const single = editing && !repeating;
  const series = editing && repeating;

  return (
    <Group justify="flex-end" gap={8}>
      <Button type="button" size={series ? 'xs' : 'sm'} variant="default" disabled={saving} onClick={onCancel}>
        Cancel
      </Button>
      {!editing ? (
        <Button type="button" loading={pending === 'create'} disabled={saving} onClick={() => onSave(null)}>
          Create event
        </Button>
      ) : null}
      {single ? (
        <Button type="button" loading={pending === 'series'} disabled={saving} onClick={() => onSave('series')}>
          Save changes
        </Button>
      ) : null}
      {series ? (
        <Button type="button" size="xs" disabled={saving} loading={pending === 'one'} onClick={() => onSave('one')}>
          This event
        </Button>
      ) : null}
      {series ? (
        <Button
          type="button"
          size="xs"
          disabled={saving}
          loading={pending === 'following'}
          onClick={() => onSave('following')}
        >
          This and future events
        </Button>
      ) : null}
      {series ? (
        <Button type="button" size="xs" disabled={saving} loading={pending === 'series'} onClick={() => onSave('series')}>
          All events
        </Button>
      ) : null}
    </Group>
  );
}
