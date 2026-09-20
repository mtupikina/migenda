import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { TextInput, UnstyledButton } from '@mantine/core';

import { loginFieldClassNames } from './loginFieldClassNames';

type LoginPasswordFieldProps = {
  error?: string;
  registration: UseFormRegisterReturn;
};

export function LoginPasswordField({ error, registration }: LoginPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { ref, ...registerProps } = registration;

  return (
    <TextInput
      id="lp-password"
      label="Password"
      placeholder="••••••••"
      autoComplete="current-password"
      type={visible ? 'text' : 'password'}
      error={error}
      ref={ref}
      rightSection={
        <UnstyledButton
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="px-1 text-[12px] uppercase tracking-[0.04em] text-accent-700 hover:text-accent"
        >
          {visible ? 'Hide' : 'Show'}
        </UnstyledButton>
      }
      rightSectionWidth={64}
      rightSectionPointerEvents="all"
      classNames={loginFieldClassNames}
      {...registerProps}
    />
  );
}
