import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { AuthRequiredError, fetchMe } from '../api/me';

export function useRequireAuth() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: (failureCount, error) => !(error instanceof AuthRequiredError) && failureCount < 1,
  });

  useEffect(() => {
    if (query.isError && query.error instanceof AuthRequiredError) {
      void navigate('/login');
    }
  }, [query.error, query.isError, navigate]);

  return query;
}
