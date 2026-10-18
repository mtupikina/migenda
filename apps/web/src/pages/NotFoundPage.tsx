import { Link } from 'react-router-dom';
import { Flex, Box, Button, Center, Group, Stack, Text, Title } from '@mantine/core';

import { Nav } from '../components/Nav';

export function NotFoundPage() {
  return (
    <Flex direction="column" mih="100vh">
      <Nav aria-label="Not found" />
      <Center flex={1} p={32}>
        <Stack align="center" gap={0} maw="44ch" ta="center">
          <Box mb={24} className="opacity-35">
          <svg
            width={64}
            height={64}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
            <path d="M3 9h18" />
            <path d="M7.5 2.5v3.5M16.5 2.5v3.5" />
            <path d="M9 14l3 3 5-5" />
            <path d="M4 20l16-16" className="stroke-accent" />
          </svg>
          </Box>
          <Title order={1} fz={26} mb={8}>
            This page doesn&apos;t exist
          </Title>
          <Text fz={14} opacity={0.65} mb={24}>
            The page you&apos;re looking for isn&apos;t here — it may have been moved, renamed, or never existed.
          </Text>
          <Group justify="center" gap={12}>
            <Button component={Link} to="/dashboard" fz={14} className="whitespace-nowrap">
              Back to schedule
            </Button>
            <Button component={Link} to="/login" variant="default" fz={14} className="whitespace-nowrap">
              Log in
            </Button>
          </Group>
        </Stack>
      </Center>
    </Flex>
  );
}
