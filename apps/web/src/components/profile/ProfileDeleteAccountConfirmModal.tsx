import { Button, Group, Modal, Stack, Text } from '@mantine/core';

type ProfileDeleteAccountConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  error: boolean;
};

export function ProfileDeleteAccountConfirmModal({
  opened,
  onClose,
  onConfirm,
  loading,
  error,
}: ProfileDeleteAccountConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete account?"
      centered
      radius={0}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      withCloseButton={!loading}
    >
      <Stack gap={20}>
        <Text fz={14}>
          This permanently removes your account and all associated data. You cannot undo this
          action.
        </Text>
        {error ? (
          <Text fz={13} c="accent.7">
            Could not delete your account. Please try again.
          </Text>
        ) : null}
        <Group justify="flex-end" gap={12}>
          <Button type="button" variant="default" fz={14} disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" fz={14} loading={loading} onClick={onConfirm}>
            Delete account
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
