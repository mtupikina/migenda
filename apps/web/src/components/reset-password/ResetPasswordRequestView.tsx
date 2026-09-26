import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Anchor, Box, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordRequestSchema, type ResetPasswordRequestInput } from '@migenda/shared';
import { loginFieldClassNames } from '../login/loginFieldClassNames';

type ResetPasswordRequestViewProps = {
  loading: boolean;
  error: boolean;
  onSubmit: (email: string) => void;
};

export function ResetPasswordRequestView({ loading, error, onSubmit }: ResetPasswordRequestViewProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { email: '' },
  });

  return (
    <Box component="form" w="100%" maw={380} noValidate onSubmit={handleSubmit(({ email }) => onSubmit(email))}>
      <Title order={1} fz={28} mb={8}>
        Reset your password
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        Enter the email associated with your account and we&apos;ll send you a link to reset your password.
      </Text>
      <Stack gap={16}>
        <TextInput
          id="rp-email"
          label="Email address"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          classNames={loginFieldClassNames}
          {...register('email')}
        />
        {error ? (
          <Text fz={13} c="accent.7">
            Something went wrong. Please try again.
          </Text>
        ) : null}
        <Button type="submit" fullWidth fz={14} loading={loading}>
          Send reset link
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
