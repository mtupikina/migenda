import { Title, Text } from '@mantine/core';

export function CreateAccountHeading() {
  return (
    <>
      <Title order={1} fz={28} mb={8}>
        Create your account
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        Start scheduling with your team in minutes.
      </Text>
    </>
  );
}
