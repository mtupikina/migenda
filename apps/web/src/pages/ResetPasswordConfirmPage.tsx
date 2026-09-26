import { Center } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';

import { ResetPasswordConfirmForm } from '../components/reset-password/ResetPasswordConfirmForm';
import { ResetPasswordInvalidLink } from '../components/reset-password/ResetPasswordInvalidLink';

export function ResetPasswordConfirmPage() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';

  return (
    <Center mih="100vh" p={32}>
      {token ? <ResetPasswordConfirmForm token={token} /> : <ResetPasswordInvalidLink />}
    </Center>
  );
}
