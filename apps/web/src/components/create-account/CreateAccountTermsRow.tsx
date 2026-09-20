import { Anchor, Checkbox, Text } from '@mantine/core';

import { RememberCheckIcon } from '../login/RememberCheckIcon';

type CreateAccountTermsRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function CreateAccountTermsRow({ checked, onChange, error }: CreateAccountTermsRowProps) {
  return (
    <>
    <Checkbox
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
      color="accent"
      size="xs"
      icon={RememberCheckIcon}
      label={
        <Text span fz={13}>
          I agree to the{' '}
          <Anchor href="#" fz={13} c="accent.7" className="hover:text-accent no-underline ml-1">
            Terms
          </Anchor>{' '}
          and{' '}
          <Anchor href="#" fz={13} c="accent.7" className="hover:text-accent no-underline">
            Privacy Policy
          </Anchor>
        </Text>
      }
      classNames={{ label: 'pl-2' }}
    />
    {error ? (
      <Text fz={13} c="accent.7" mt={4}>
        {error}
      </Text>
    ) : null}
    </>
  );
}
