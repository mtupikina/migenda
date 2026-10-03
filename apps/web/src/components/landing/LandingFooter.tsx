import { Link } from 'react-router-dom';
import { Anchor, Container, Group, Text } from '@mantine/core';

import type { LandingVisitor } from '../../landingVisitor';

export function LandingFooter({ visitor }: { visitor: LandingVisitor }) {
  const showGuest = visitor === 'guest';
  const showMember = visitor === 'member';

  return (
    <Container size={1200} px={{ base: 20, sm: 72 }}>
      <Group justify="space-between" py={56} fz={13} lh="28px" opacity={0.7}>
        <Text span>© 2026 MiGenda.</Text>
        {showGuest ? (
          <Anchor component={Link} to="/login">
            Already have an account? Log in
          </Anchor>
        ) : null}
        {showMember ? (
          <Anchor component={Link} to="/dashboard">
            Go to your schedule
          </Anchor>
        ) : null}
      </Group>
    </Container>
  );
}
