import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Group, Paper, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfileSchema, type UpdateProfileInput, type User } from '@migenda/shared';
import { patchProfile, ProfileUpdateError } from '../../api/profile';
import {
  loginFieldClassNames,
  profileCardClassName,
  profileCardTitleClassName,
} from '../../classNames/shared';

type ProfilePersonalInfoCardProps = {
  user: User;
};

function profileErrorMessage(error: unknown) {
  if (error instanceof ProfileUpdateError && error.code === 'email_taken') {
    return 'An account with this email already exists.';
  }
  return 'Could not save your changes. Please try again.';
}

export function ProfilePersonalInfoCard({ user }: ProfilePersonalInfoCardProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: patchProfile,
    onSuccess: (nextUser) => {
      queryClient.setQueryData(['auth', 'me'], nextUser);
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  }, [reset, user.email, user.firstName, user.lastName, user.role]);

  return (
    <Paper p={24} className={profileCardClassName}>
      <Text component="p" className={profileCardTitleClassName}>
        Personal information
      </Text>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <Stack gap={16}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
            <TextInput
              id="pf-first"
              label="First name"
              error={errors.firstName?.message}
              classNames={loginFieldClassNames}
              {...register('firstName')}
            />
            <TextInput
              id="pf-last"
              label="Last name"
              error={errors.lastName?.message}
              classNames={loginFieldClassNames}
              {...register('lastName')}
            />
          </SimpleGrid>
          <TextInput
            id="pf-email"
            label="Email address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            classNames={loginFieldClassNames}
            {...register('email')}
          />
          <TextInput
            id="pf-role"
            label="Role"
            error={errors.role?.message}
            classNames={loginFieldClassNames}
            {...register('role')}
          />
          {mutation.isError ? (
            <Text fz={13} c="accent.7">
              {profileErrorMessage(mutation.error)}
            </Text>
          ) : null}
          {mutation.isSuccess && !mutation.isPending ? (
            <Text fz={13} c="dimmed">
              Changes saved.
            </Text>
          ) : null}
          <Group justify="flex-end">
            <Button type="submit" fz={14} loading={mutation.isPending}>
              Save changes
            </Button>
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
}
