import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Anchor } from '@mantine/core';

type AppNavLinkProps = {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  activePrefix?: string;
};

export function AppNavLink({ to, children, onClick, activePrefix }: AppNavLinkProps) {
  const { pathname } = useLocation();
  const prefix = activePrefix ?? to;
  const active = pathname === prefix || pathname.startsWith(`${prefix}/`);

  return (
    <Anchor
      component={Link}
      to={to}
      c="inherit"
      fz={{ base: 13, sm: 14 }}
      fw={active ? 600 : undefined}
      className="hover:text-body"
      onClick={onClick}
    >
      {children}
    </Anchor>
  );
}
