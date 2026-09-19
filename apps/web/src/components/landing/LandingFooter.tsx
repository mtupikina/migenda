import { Link } from 'react-router-dom';
import { Anchor, Container, Group, Text } from '@mantine/core';

export function LandingFooter() {
  return (
    <Container size={1200} px={{ base: 20, sm: 72 }}>
      <Group justify="space-between" py={56} fz={13} lh="28px" opacity={0.7}>
        <Text span>© 2026 MiGenda.</Text>
        <Anchor component={Link} to="/login">
          Already have an account? Log in
        </Anchor>
      </Group>
    </Container>
  );
}
