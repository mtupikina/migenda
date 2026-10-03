import { Link } from 'react-router-dom';
import { Anchor, Group, Image, Text } from '@mantine/core';

export function BrandMark() {
  return (
    <Anchor component={Link} to="/" mr="auto" c="inherit" td="none">
      <Group gap={8} wrap="nowrap">
        <Image src="/brand-icon.png" alt="" h={28} w="auto" />
        <Text fw={800} fz={18}>
          MiGenda
        </Text>
      </Group>
    </Anchor>
  );
}
