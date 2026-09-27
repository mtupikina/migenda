import { Flex } from '@mantine/core';

import { LogoutConfirmation } from '../components/logout/LogoutConfirmation';
import { Nav } from '../components/Nav';

export function LogoutPage() {
  return (
    <Flex direction="column" mih="100vh">
      <Nav aria-label="Auth" />
      <LogoutConfirmation />
    </Flex>
  );
}
