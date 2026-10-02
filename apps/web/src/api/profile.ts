import type { PatchProfileInput, User } from '@migenda/shared';

import { apiPath } from './apiPath';

export class ProfileUpdateError extends Error {
  constructor(readonly code: 'email_taken' | 'invalid_current_password' | 'failed') {
    super(code);
    this.name = 'ProfileUpdateError';
  }
}

export async function patchProfile(input: PatchProfileInput): Promise<User> {
  const response = await fetch(apiPath('/profile'), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new ProfileUpdateError('email_taken');
  }

  if (response.status === 401) {
    throw new ProfileUpdateError('invalid_current_password');
  }

  if (!response.ok) {
    throw new ProfileUpdateError('failed');
  }

  return response.json() as Promise<User>;
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch(apiPath('/profile'), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ProfileUpdateError('failed');
  }
}
