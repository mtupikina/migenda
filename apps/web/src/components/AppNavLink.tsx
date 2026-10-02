import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Anchor } from '@mantine/core';

type AppNavLinkProps = {
  to: string;
  children: ReactNode;
};

export function AppNavLink({ to, children }: AppNavLinkProps) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Anchor
      component={Link}
      to={to}
      c="inherit"
      fz={14}
      fw={active ? 600 : undefined}
      className="hover:text-body"
    >
      {children}
    </Anchor>
  );
}
