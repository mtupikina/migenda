import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

export function LogOutNavLink() {
  return (
    <Button component={Link} to="/logout" variant="default" fz={14}>
      Log out
    </Button>
  );
}
