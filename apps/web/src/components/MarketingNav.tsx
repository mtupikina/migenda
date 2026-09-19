import { Link } from 'react-router-dom';
import { Anchor, Button } from '@mantine/core';

import { Nav } from './Nav';

export function MarketingNav() {
  return (
    <Nav aria-label="Marketing">
      <Anchor href="#features" c="inherit" fz={14}>
        Product
      </Anchor>
      <Button component={Link} to="/login" variant="default">
        Log in
      </Button>
      <Button component={Link} to="/login" className="hover:text-body">
        Get started
      </Button>
    </Nav>
  );
}
