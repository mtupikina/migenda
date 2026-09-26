import { Link } from 'react-router-dom';
import { Anchor, Box, Button, Text, Title } from '@mantine/core';

export function ResetPasswordInvalidLink() {
  return (
    <Box w="100%" maw={380} ta="center">
      <Title order={1} fz={28} mb={8}>
        Invalid reset link
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        This password reset link is missing or invalid. Request a new link from the sign-in page.
      </Text>
      <Button component={Link} to="/reset-password" variant="default" fullWidth fz={14} mb={16}>
        Request reset link
      </Button>
      <Anchor component={Link} to="/login" fw={600} c="accent.7" className="hover:text-accent">
        Back to sign in
      </Anchor>
    </Box>
  );
}
