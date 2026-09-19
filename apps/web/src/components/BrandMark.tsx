import { Group, Image, Text } from '@mantine/core';

export function BrandMark() {
  return (
    <Group gap={8} mr="auto" wrap="nowrap">
      <Image src="/brand-icon.png" alt="" h={28} w="auto" />
      <Text fw={800} fz={18}>
        MiGenda
      </Text>
    </Group>
  );
}
