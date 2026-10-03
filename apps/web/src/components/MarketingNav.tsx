import { Link } from 'react-router-dom';
import { Anchor, Button } from '@mantine/core';

import type { LandingVisitor } from '../landingVisitor';
import { Nav } from './Nav';

export function MarketingNav({ visitor }: { visitor: LandingVisitor }) {
  const showGuest = visitor === 'guest';
  const showMember = visitor === 'member';

  return (
    <Nav aria-label="Marketing">
      <Anchor href="#features" c="inherit" fz={14}>
        Product
      </Anchor>
      {showGuest ? (
        <>
          <Button component={Link} to="/login" variant="default">
            Log in
          </Button>
          <Button component={Link} to="/login" className="hover:text-body">
            Get started
          </Button>
        </>
      ) : null}
      {showMember ? (
        <Button component={Link} to="/dashboard" className="hover:text-body">
          Go to schedule
        </Button>
      ) : null}
    </Nav>
  );
}
