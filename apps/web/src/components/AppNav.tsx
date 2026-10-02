import { Group } from '@mantine/core';

import { AppNavLink } from './AppNavLink';
import { LogOutNavLink } from './LogOutNavLink';
import { Nav } from './Nav';

export function AppNav() {
  return (
    <Nav aria-label="App">
      <Group gap={24} ml="auto" wrap="nowrap">
        <AppNavLink to="/dashboard">Schedule</AppNavLink>
        <AppNavLink to="/search">Search</AppNavLink>
        <AppNavLink to="/reports">Reports</AppNavLink>
        <AppNavLink to="/team">Team</AppNavLink>
        <AppNavLink to="/profile">Profile</AppNavLink>
        <LogOutNavLink />
      </Group>
    </Nav>
  );
}
