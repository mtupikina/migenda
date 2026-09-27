import { Group } from '@mantine/core';

import { LogOutNavLink } from './LogOutNavLink';
import { Nav } from './Nav';

export function AppNav() {
  return (
    <Nav aria-label="App">
      <Group gap={24} ml="auto" wrap="nowrap">
        <LogOutNavLink />
      </Group>
    </Nav>
  );
}
