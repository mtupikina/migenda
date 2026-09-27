import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Center, Stack, Text, Title } from '@mantine/core';

import { logout } from '../../api/auth';
import { LogoutSuccessIcon } from './LogoutSuccessIcon';

export function LogoutConfirmation() {
  useEffect(() => {
    void logout().catch(() => {
      // Session may already be cleared; still show confirmation.
    });
  }, []);

  return (
    <Center flex={1} p={32}>
      <Stack align="center" gap={0} maw="44ch" ta="center">
        <Box mb={24} c="accent.5">
          <LogoutSuccessIcon />
        </Box>
        <Title order={1} fz={26} mb={8}>
          You&apos;ve been logged out
        </Title>
        <Text fz={14} opacity={0.65} mb={24}>
          You have successfully signed out of your account.
        </Text>
        <Button component={Link} to="/login" fz={14}>
          Log in again
        </Button>
      </Stack>
    </Center>
  );
}
