import { useQuery } from '@tanstack/react-query';

import { AuthRequiredError, fetchMe } from '../api/me';

export function useSession() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: (failureCount, error) => !(error instanceof AuthRequiredError) && failureCount < 1,
  });
}
