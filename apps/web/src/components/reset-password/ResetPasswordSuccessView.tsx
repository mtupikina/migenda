import { Link } from 'react-router-dom';
import { Box, Button, Text, Title } from '@mantine/core';

type ResetPasswordSuccessViewProps = {
  email: string;
};

export function ResetPasswordSuccessView({ email }: ResetPasswordSuccessViewProps) {
  return (
    <Box w="100%" maw={380} ta="center">
      <Title order={1} fz={28} mb={8}>
        Check your email
      </Title>
      <Text fz={14} opacity={0.65} mb={24}>
        We&apos;ve sent a password reset link to {email}.
      </Text>
      <Button component={Link} to="/login" variant="default" fullWidth fz={14}>
        Back to sign in
      </Button>
    </Box>
  );
}
