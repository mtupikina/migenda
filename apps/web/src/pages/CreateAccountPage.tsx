import { Center } from '@mantine/core';

import { CreateAccountForm } from '../components/create-account/CreateAccountForm';

export function CreateAccountPage() {
  return (
    <Center mih="100vh" p={32}>
      <CreateAccountForm />
    </Center>
  );
}
