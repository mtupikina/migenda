import { Link } from 'react-router-dom';
import { Box, Button, Container, Title } from '@mantine/core';

export function LandingCta() {
  return (
    <Box bg="accent.5" c="#f3f2f2">
      <Container size={1200} px={{ base: 20, sm: 72 }} py={84}>
        <Title order={3} fz={{ base: 34, md: 56 }} lh={{ base: '36px', md: '59px' }} lts="-0.015em" ml="-0.058em">
          Put your team on the same clock.
        </Title>
        <Button
          component={Link}
          to="/login"
          variant="outline"
          color="gray"
          c="#f3f2f2"
          mt={42}
          className="hover:text-ink"
        >
          Get started
        </Button>
      </Container>
    </Box>
  );
}
