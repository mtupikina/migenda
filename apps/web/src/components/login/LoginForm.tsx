import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Text, TextInput } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { loginSchema, type LoginInput } from '@migenda/shared';
import { login } from '../../api/auth';
import { LoginHeading } from './LoginHeading';
import { loginFieldClassNames } from './loginFieldClassNames';
import { LoginPasswordField } from './LoginPasswordField';
import { LoginRememberRow } from './LoginRememberRow';
import { LoginSignUpPrompt } from './LoginSignUpPrompt';

export function LoginForm() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      void navigate('/dashboard');
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  return (
    <Box
      component="form"
      w="100%"
      maw={380}
      noValidate
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      <LoginHeading />
      <Stack gap={16}>
        <TextInput
          id="lp-email"
          label="Email address"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          classNames={loginFieldClassNames}
          {...register('email')}
        />
        <LoginPasswordField error={errors.password?.message} registration={register('password')} />
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <LoginRememberRow checked={field.value} onChange={field.onChange} />
          )}
        />
        {mutation.isError ? (
          <Text fz={13} c="accent.7">
            Invalid email or password.
          </Text>
        ) : null}
        <Button type="submit" fullWidth mt={8} fz={14} loading={mutation.isPending}>
          Sign in
        </Button>
      </Stack>
      <LoginSignUpPrompt />
    </Box>
  );
}
