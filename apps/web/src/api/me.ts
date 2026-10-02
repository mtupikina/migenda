import type { User } from '@migenda/shared';

import { apiPath } from './apiPath';

export class AuthRequiredError extends Error {
  constructor() {
    super('auth_required');
    this.name = 'AuthRequiredError';
  }
}

export async function fetchMe(): Promise<User> {
  const response = await fetch(apiPath('/auth/me'), { credentials: 'include' });

  if (response.status === 401) {
    throw new AuthRequiredError();
  }

  if (!response.ok) {
    throw new Error('Failed to load profile');
  }

  return response.json() as Promise<User>;
}
