import { Button, SimpleGrid } from '@mantine/core';

import { apiPath } from '../../api/apiPath';

export function LoginSocialButtons() {
  return (
    <SimpleGrid cols={2} spacing={12}>
      <Button component="a" href={apiPath('/auth/google')} variant="default" fz={14}>
        Google
      </Button>
      <Button component="a" href={apiPath('/auth/github')} variant="default" fz={14}>
        GitHub
      </Button>
    </SimpleGrid>
  );
}
