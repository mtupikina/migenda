import { useSearchParams } from 'react-router-dom';
import { Text } from '@mantine/core';

const oauthMessages: Record<string, string> = {
  denied: 'Sign-in was cancelled.',
  unavailable: 'That sign-in method is not configured yet.',
  missing_email: 'That account has no email we can use.',
  failed: 'Could not sign in with that provider.',
};

export function LoginOauthError() {
  const [params] = useSearchParams();
  const code = params.get('oauth');
  if (!code) {
    return null;
  }

  return (
    <Text fz={13} c="accent.7" mt={16}>
      {oauthMessages[code] ?? oauthMessages.failed}
    </Text>
  );
}
