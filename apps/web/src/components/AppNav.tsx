import { Group } from '@mantine/core';

import { calendarPath } from '../schedule/calendarPeriod';
import { AppNavLink } from './AppNavLink';
import { AppNavMenu } from './AppNavMenu';
import { Nav } from './Nav';

export function AppNav() {
  const calendarToday = calendarPath('week', new Date());

  return (
    <Nav aria-label="App">
      <Group gap={0} ml="auto" wrap="nowrap" align="center" className="gap-2 sm:gap-5">
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
