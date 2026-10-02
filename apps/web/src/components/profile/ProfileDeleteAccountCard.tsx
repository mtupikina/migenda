import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAccount } from '../../api/profile';
import { profileCardTitleClassName, profileDangerCardClassName } from '../../classNames/shared';
import { ProfileDeleteAccountConfirmModal } from './ProfileDeleteAccountConfirmModal';

export function ProfileDeleteAccountCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, confirmHandlers] = useDisclosure(false);
  const [showCardError, setShowCardError] = useState(false);
  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      confirmHandlers.close();
      void navigate('/');
    },
    onError: () => {
      setShowCardError(true);
    },
  });

  return (
    <>
      <Paper p={24} className={profileDangerCardClassName}>
        <Group justify="space-between" align="center" gap={16} wrap="wrap">
          <Stack gap={4}>
            <Text component="p" className={profileCardTitleClassName} mb={0}>
              Delete account
            </Text>
            <Text fz={13} c="dimmed">
              Permanently remove your account and all associated data.
            </Text>
          </Stack>
          <Button
            type="button"
            variant="default"
            fz={14}
            className="border-accent text-accent-700 hover:text-accent"
            onClick={() => {
              setShowCardError(false);
              mutation.reset();
              confirmHandlers.open();
            }}
          >
            Delete account
          </Button>
        </Group>
        {showCardError && !confirmOpen ? (
          <Text fz={13} c="accent.7" mt={12}>
            Could not delete your account. Please try again.
          </Text>
        ) : null}
      </Paper>
      <ProfileDeleteAccountConfirmModal
        opened={confirmOpen}
        onClose={confirmHandlers.close}
        onConfirm={() => mutation.mutate()}
        loading={mutation.isPending}
        error={mutation.isError}
      />
    </>
  );
}
