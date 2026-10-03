import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthRequiredError } from '../api/me';
import { useSession } from './useSession';

export function useRequireAuth() {
  const navigate = useNavigate();
  const query = useSession();

  useEffect(() => {
    if (query.isError && query.error instanceof AuthRequiredError) {
      void navigate('/login');
    }
  }, [query.error, query.isError, navigate]);

  return query;
}
