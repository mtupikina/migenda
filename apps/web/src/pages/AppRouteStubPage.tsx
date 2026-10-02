import { Box } from '@mantine/core';

import { AppNav } from '../components/AppNav';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function AppRouteStubPage() {
  useRequireAuth();

  return (
    <Box mih="100vh">
      <AppNav />
    </Box>
  );
}
