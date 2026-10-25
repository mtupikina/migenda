import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Group, Text, UnstyledButton } from '@mantine/core';

type AppNavDrawerLinkProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export function AppNavDrawerLink({ to, label, icon: Icon, onClick }: AppNavDrawerLinkProps) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(`${to}/`);
  const activeClass = active
    ? 'border-accent bg-[color-mix(in_srgb,#201e1d_6%,transparent)] font-semibold'
    : 'border-transparent font-normal';

  return (
    <UnstyledButton
      component={Link}
      to={to}
      onClick={onClick}
      className={`block w-full border-l-2 px-5 py-3.5 text-left hover:bg-[color-mix(in_srgb,#201e1d_4%,transparent)] ${activeClass}`}
    >
      <Group gap={12} wrap="nowrap">
        <Icon size={18} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
        <Text component="span" fz={14} inherit>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}
