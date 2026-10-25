import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, User, Users } from 'lucide-react';
import { Box, Burger, Button, Drawer, Stack, Text } from '@mantine/core';

import { appNavDrawerClassNames, dashboardKickerClassName } from '../classNames/shared';
import { AppNavDrawerLink } from './AppNavDrawerLink';
import { TeamSwitcher } from './TeamSwitcher';

const secondaryRoutes = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/event-types', label: 'Event types', icon: Tag },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
] as const;

export function AppNavMenu() {
  const [opened, setOpened] = useState(false);
  const close = () => setOpened(false);
  const toggle = () => setOpened((value) => !value);

  return (
    <>
      <Burger
        opened={opened}
        onClick={toggle}
        size="sm"
        aria-label={opened ? 'Close menu' : 'Open menu'}
      />
      <Drawer
        opened={opened}
        onClose={close}
        title="More"
        position="right"
        radius={0}
        size="100%"
        withOverlay
        overlayProps={{ backgroundOpacity: 0.35 }}
        classNames={appNavDrawerClassNames}
      >
        <Stack gap={0}>
          <Stack gap={0} py={8}>
            {secondaryRoutes.map(({ to, label, icon }) => (
              <AppNavDrawerLink key={to} to={to} label={label} icon={icon} onClick={close} />
            ))}
          </Stack>
          <Box
            px={20}
            py={20}
            className="border-t-2 border-[color-mix(in_srgb,#201e1d_28%,transparent)] bg-[color-mix(in_srgb,#201e1d_3%,transparent)]"
          >
            <Text className={`${dashboardKickerClassName} mb-3`}>Team</Text>
            <TeamSwitcher />
            <Button component={Link} to="/logout" variant="default" fz={14} className="mt-4 w-full">
              Log out
            </Button>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
