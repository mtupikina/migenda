import { Link } from 'react-router-dom';
import { Anchor, Checkbox, Group } from '@mantine/core';

import { RememberCheckIcon } from './RememberCheckIcon';

type LoginRememberRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function LoginRememberRow({ checked, onChange }: LoginRememberRowProps) {
  return (
    <Group justify="space-between" mt={4} wrap="nowrap">
      <Checkbox
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        label="Remember me"
        size="xs"
        color="accent"
        icon={RememberCheckIcon}
        classNames={{ label: 'text-[13px] pl-2' }}
      />
      <Anchor component={Link} to="/reset-password" fz={13} c="accent.7" className="hover:text-accent">
        Forgot password?
      </Anchor>
    </Group>
  );
}
