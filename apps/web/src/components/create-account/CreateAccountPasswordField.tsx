import type { UseFormRegisterReturn } from 'react-hook-form';
import { TextInput, UnstyledButton } from '@mantine/core';

import { loginFieldClassNames } from '../login/loginFieldClassNames';

type CreateAccountPasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  visible: boolean;
  onToggleVisible: () => void;
  registration: UseFormRegisterReturn;
};

export function CreateAccountPasswordField({
  id,
  label,
  error,
  visible,
  onToggleVisible,
  registration,
}: CreateAccountPasswordFieldProps) {
  const { ref, ...registerProps } = registration;

  return (
    <TextInput
      id={id}
      label={label}
      placeholder="••••••••"
      autoComplete="new-password"
      type={visible ? 'text' : 'password'}
      error={error}
      ref={ref}
      rightSection={
        <UnstyledButton
          type="button"
          onClick={onToggleVisible}
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
