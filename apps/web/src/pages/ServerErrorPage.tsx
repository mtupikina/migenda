import { Link } from 'react-router-dom';
import { Box, Button, Center, Flex, Group, Stack, Text, Title } from '@mantine/core';

import { Nav } from '../components/Nav';

type ServerErrorPageProps = {
  onRetry: () => void;
};

export function ServerErrorPage({ onRetry }: ServerErrorPageProps) {
  return (
    <Flex direction="column" mih="100vh">
      <Nav aria-label="Server error" />
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
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" className="stroke-accent" />
              <circle cx="12" cy="16.3" r="0.9" className="fill-accent stroke-none" />
            </svg>
          </Box>
          <Title order={1} fz={26} mb={8}>
            Something went wrong
          </Title>
          <Text fz={14} opacity={0.65} mb={24}>
            An unexpected error interrupted that action. Nothing was saved — please try again in a
            moment.
          </Text>
          <Group justify="center" gap={12}>
            <Button type="button" fz={14} className="whitespace-nowrap" onClick={onRetry}>
              Try again
            </Button>
            <Button
              component={Link}
              to="/dashboard"
              variant="default"
              fz={14}
              className="whitespace-nowrap"
              onClick={onRetry}
            >
              Back to schedule
            </Button>
          </Group>
        </Stack>
      </Center>
    </Flex>
  );
}
