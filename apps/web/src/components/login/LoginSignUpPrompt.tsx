import { Link } from 'react-router-dom';
import { Anchor, Text } from '@mantine/core';

export function LoginSignUpPrompt() {
  return (
    <Text fz={14} ta="center" mt={24}>
      Don't have an account?{' '}
      <Anchor component={Link} to="/create-account" fw={600} c="accent.7" className="hover:text-accent">
        Sign up
      </Anchor>
    </Text>
  );
}
