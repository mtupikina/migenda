import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, TextInput } from '@mantine/core';
import { zodResolver } from '@hookform/resolvers/zod';

import { createAccountSchema, type CreateAccountInput } from '@migenda/shared';
import { loginFieldClassNames } from '../login/loginFieldClassNames';
import { CreateAccountHeading } from './CreateAccountHeading';
import { CreateAccountPasswordField } from './CreateAccountPasswordField';
import { CreateAccountSignInPrompt } from './CreateAccountSignInPrompt';
import { CreateAccountTermsRow } from './CreateAccountTermsRow';

export function CreateAccountForm() {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  return (
    <Box
      component="form"
      w="100%"
      maw={380}
      noValidate
      onSubmit={handleSubmit(() => {
        void navigate('/get-started');
      })}
    >
      <CreateAccountHeading />
      <Stack gap={16}>
        <TextInput
          id="ca-name"
          label="Full name"
          placeholder="Jordan Rivera"
          autoComplete="name"
          error={errors.name?.message}
          classNames={loginFieldClassNames}
          {...register('name')}
        />
        <TextInput
          id="ca-email"
          label="Email address"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          classNames={loginFieldClassNames}
          {...register('email')}
        />
        <CreateAccountPasswordField
          id="ca-password"
          label="Password"
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((value) => !value)}
          error={errors.password?.message}
          registration={register('password')}
        />
        <CreateAccountPasswordField
          id="ca-password-confirm"
          label="Confirm password"
          visible={passwordVisible}
          onToggleVisible={() => setPasswordVisible((value) => !value)}
          error={errors.confirmPassword?.message}
          registration={register('confirmPassword')}
        />
        <Controller
          name="agreeToTerms"
          control={control}
          render={({ field }) => (
            <CreateAccountTermsRow
              checked={field.value}
              onChange={field.onChange}
              error={errors.agreeToTerms?.message}
            />
          )}
        />
        <Button type="submit" fullWidth mt={8} fz={14}>
          Create account
        </Button>
      </Stack>
      <CreateAccountSignInPrompt />
    </Box>
  );
}
