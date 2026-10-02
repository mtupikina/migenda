import { useRef } from 'react';
import { Avatar, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userFullName, type User } from '@migenda/shared';
import { patchProfile, ProfileUpdateError } from '../../api/profile';
import { profileCardClassName } from '../../classNames/shared';

type ProfileAvatarCardProps = {
  user: User;
};

function avatarInitials(user: User) {
  const first = user.firstName.trim().charAt(0);
  const last = user.lastName.trim().charAt(0);
  const initials = `${first}${last}`.trim();
  if (initials) {
    return initials.toUpperCase();
  }
  return userFullName(user).charAt(0).toUpperCase() || '?';
}

export function ProfileAvatarCard({ user }: ProfileAvatarCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (avatarUrl: string) => patchProfile({ avatarUrl }),
    onSuccess: (nextUser) => {
      queryClient.setQueryData(['auth', 'me'], nextUser);
    },
  });

  return (
    <Paper p={24} className={profileCardClassName}>
      <Group align="center" gap={16} wrap="nowrap">
        <Avatar src={user.avatarUrl} alt="" radius="50%" size={84} color="accent">
          {avatarInitials(user)}
        </Avatar>
        <Stack gap={12}>
          <Box>
            <Text fw={800} fz={18} lh={1.2}>
              {userFullName(user)}
            </Text>
            <Text fz={13} c="dimmed" mt={4}>
              {user.email}
            </Text>
          </Box>
          <Box>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) {
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const result = typeof reader.result === 'string' ? reader.result : '';
                  if (result) {
                    mutation.mutate(result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <Button
              type="button"
              variant="default"
              fz={14}
              loading={mutation.isPending}
              onClick={() => inputRef.current?.click()}
            >
              Change photo
            </Button>
            {mutation.isError ? (
              <Text fz={13} c="accent.7" mt={8}>
                {mutation.error instanceof ProfileUpdateError
                  ? 'Could not update your photo. Try a smaller image.'
                  : 'Could not update your photo.'}
              </Text>
            ) : null}
          </Box>
        </Stack>
      </Group>
    </Paper>
  );
}
