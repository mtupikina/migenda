import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Box, Button, Stack, Text, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { completePasswordResetSchema, type CompletePasswordResetInput } from '@migenda/shared';
import { completePasswordReset, PasswordResetError } from '../../api/auth';
import { CreateAccountPasswordField } from '../create-account/CreateAccountPasswordField';

type ResetPasswordConfirmFormProps = {
  token: string;
};

function resetMessage(error: unknown) {
  if (error instanceof PasswordResetError && error.code === 'invalid_token') {
    return 'This reset link is invalid or has expired.';
  }
  return 'Something went wrong. Please try again.';
}

export function ResetPasswordConfirmForm({ token }: ResetPasswordConfirmFormProps) {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const mutation = useMutation({
    mutationFn: ({ password }: CompletePasswordResetInput) => completePasswordReset(token, password),
    onSuccess: () => {
      void navigate('/login');
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompletePasswordResetInput>({
    resolver: zodResolver(completePasswordResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  return (
    <Box
      component="form"
      w="100%"
      maw={380}
      noValidate
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <Title order={1} fz={28} mb={8}>
        Choose a new password
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        Enter a new password for your account.
      </Text>
      <Stack gap={16}>
        <CreateAccountPasswordField
          id="rp-new-password"
          label="New password"
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((value) => !value)}
          error={errors.password?.message}
          registration={register('password')}
        />
        <CreateAccountPasswordField
          id="rp-new-password-confirm"
          label="Confirm password"
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((value) => !value)}
          error={errors.confirmPassword?.message}
          registration={register('confirmPassword')}
        />
        {mutation.isError ? (
          <Text fz={13} c="accent.7">
            {resetMessage(mutation.error)}
          </Text>
        ) : null}
        <Button type="submit" fullWidth fz={14} loading={mutation.isPending}>
          Update password
        </Button>
      </Stack>
      <Text fz={14} ta="center" mt={24}>
        <Anchor component={Link} to="/login" fw={600} c="accent.7" className="hover:text-accent">
          Back to sign in
        </Anchor>
      </Text>
    </Box>
  );
}
