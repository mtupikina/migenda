import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

type LogOutNavLinkProps = {
  fullWidth?: boolean;
};

export function LogOutNavLink({ fullWidth = false }: LogOutNavLinkProps) {
  return (
    <Button
      component={Link}
      to="/logout"
      variant="default"
      fz={14}
      className={fullWidth ? 'w-full' : undefined}
    >
      Log out
    </Button>
  );
}
