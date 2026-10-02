import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { changePasswordSchema, type ChangePasswordInput, type User } from '@migenda/shared';
import { patchProfile, ProfileUpdateError } from '../../api/profile';
import { CreateAccountPasswordField } from '../create-account/CreateAccountPasswordField';
import { profileCardClassName, profileCardTitleClassName } from '../../classNames/shared';

type ProfilePasswordCardProps = {
  user: User;
};

function passwordErrorMessage(error: unknown) {
  if (error instanceof ProfileUpdateError && error.code === 'invalid_current_password') {
    return 'Current password is incorrect.';
  }
  return 'Could not update your password. Please try again.';
}

export function ProfilePasswordCard({ user }: ProfilePasswordCardProps) {
  const queryClient = useQueryClient();
  const [currentVisible, setCurrentVisible] = useState(false);
  const [newVisible, setNewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const mutation = useMutation({
    mutationFn: (values: ChangePasswordInput) => patchProfile({ password: values }),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(['auth', 'me'], nextUser);
      reset();
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <Paper p={24} className={profileCardClassName}>
      <Text component="p" className={profileCardTitleClassName}>
        Password
      </Text>
      {!user.hasPassword ? (
        <Text fz={13} c="dimmed" mb={16}>
          You signed in with a social account. Set a password here to also sign in with email.
        </Text>
      ) : null}
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit((values) => {
          if (user.hasPassword && !values.currentPassword.trim()) {
            setError('currentPassword', { message: 'Enter your current password' });
            return;
          }
          mutation.mutate({
            ...values,
            currentPassword: user.hasPassword ? values.currentPassword : '',
          });
        })}
      >
        <Stack gap={16}>
          {user.hasPassword ? (
            <CreateAccountPasswordField
              id="pf-current-password"
              label="Current password"
              visible={currentVisible}
              onToggleVisible={() => setCurrentVisible((value) => !value)}
              error={errors.currentPassword?.message}
              registration={register('currentPassword')}
            />
          ) : null}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
            <CreateAccountPasswordField
              id="pf-new-password"
              label="New password"
              visible={newVisible}
              onToggleVisible={() => setNewVisible((value) => !value)}
              error={errors.newPassword?.message}
              registration={register('newPassword')}
            />
            <CreateAccountPasswordField
              id="pf-confirm-password"
              label="Confirm new password"
              visible={confirmVisible}
              onToggleVisible={() => setConfirmVisible((value) => !value)}
              error={errors.confirmPassword?.message}
              registration={register('confirmPassword')}
            />
          </SimpleGrid>
          {mutation.isError ? (
            <Text fz={13} c="accent.7">
              {passwordErrorMessage(mutation.error)}
            </Text>
          ) : null}
          {mutation.isSuccess && !mutation.isPending ? (
            <Text fz={13} c="dimmed">
              Password updated.
            </Text>
          ) : null}
          <Group justify="flex-end">
            <Button type="submit" fz={14} loading={mutation.isPending}>
              Update password
            </Button>
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
}
