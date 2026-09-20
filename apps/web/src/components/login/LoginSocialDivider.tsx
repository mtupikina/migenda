import { Box, Group, Text } from '@mantine/core';

import { divider } from '../../theme';

export function LoginSocialDivider() {
  return (
    <Group gap={12} my={24} wrap="nowrap">
      <Box h={2} bg={divider} className="min-w-0 flex-1" />
      <Text fz={11} lts="0.1em" tt="uppercase" opacity={0.5}>
        Or continue with
      </Text>
      <Box h={2} bg={divider} className="min-w-0 flex-1" />
    </Group>
  );
}
