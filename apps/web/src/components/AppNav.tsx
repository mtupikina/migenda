import { Group } from '@mantine/core';

import { calendarPath } from '../schedule/calendarPeriod';
import { AppNavLink } from './AppNavLink';
import { AppNavMenu } from './AppNavMenu';
import { Nav } from './Nav';

export function AppNav() {
  const calendarToday = calendarPath('month', new Date());

  return (
    <Nav aria-label="App">
      <Group gap={{ base: 8, sm: 20 }} ml="auto" wrap="nowrap" align="center">
        <AppNavLink to="/dashboard">Schedule</AppNavLink>
        <AppNavLink to={calendarToday} activePrefix="/calendar">
          Calendar
        </AppNavLink>
        <AppNavLink to="/reports">Reports</AppNavLink>
        <AppNavMenu />
      </Group>
    </Nav>
  );
}
