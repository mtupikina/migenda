import { Title, Text } from '@mantine/core';

export function LoginHeading() {
  return (
    <>
      <Title order={1} fz={28} mb={8}>
        Happy to see you
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        Sign in to your account to continue.
      </Text>
    </>
  );
}
