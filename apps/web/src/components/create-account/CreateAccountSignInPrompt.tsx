import { Link } from 'react-router-dom';
import { Anchor, Text } from '@mantine/core';

export function CreateAccountSignInPrompt() {
  return (
    <Text fz={14} ta="center" mt={24}>
      Already have an account?{' '}
      <Anchor component={Link} to="/login" fw={600} c="accent.7" className="hover:text-accent">
        Sign in
      </Anchor>
    </Text>
  );
}
