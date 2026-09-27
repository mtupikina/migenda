import { Link } from 'react-router-dom';
import { Anchor } from '@mantine/core';

export function LogOutNavLink() {
  return (
    <Anchor component={Link} to="/logout" c="inherit" fz={14} className="hover:text-body">
      Log out
    </Anchor>
  );
}
