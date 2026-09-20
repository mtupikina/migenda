import { Center } from '@mantine/core';

import { LoginForm } from '../components/login/LoginForm';

export function LoginPage() {
  return (
    <Center mih="100vh" p={32}>
      <LoginForm />
    </Center>
  );
}
