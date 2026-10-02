import type {
  User,
  LoginInput,
  RegisterInput,
  ResetPasswordRequestInput,
} from '@migenda/shared';

import { apiPath } from './apiPath';

export class RegisterError extends Error {
  constructor(readonly code: 'email_taken' | 'failed') {
    super(code);
    this.name = 'RegisterError';
  }
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await fetch(apiPath('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new RegisterError('email_taken');
  }

  if (response.status === 400) {
    const body = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const detail = body?.message;
    if (typeof detail === 'string') {
      throw new Error(detail);
    }
    if (Array.isArray(detail)) {
      throw new Error(detail.join(' '));
    }
  }

  if (!response.ok) {
    throw new RegisterError('failed');
  }

  return response.json() as Promise<User>;
}

export class PasswordResetError extends Error {
  constructor(readonly code: 'invalid_token' | 'failed') {
    super(code);
    this.name = 'PasswordResetError';
  }
}

export async function requestPasswordReset(input: ResetPasswordRequestInput): Promise<void> {
  const response = await fetch(apiPath('/auth/forgot-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new PasswordResetError('failed');
  }
}

export async function completePasswordReset(token: string, password: string): Promise<void> {
  const response = await fetch(apiPath('/auth/reset-password'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, password }),
  });

  if (response.status === 400) {
    throw new PasswordResetError('invalid_token');
  }

  if (!response.ok) {
    throw new PasswordResetError('failed');
  }
}

export async function logout(): Promise<void> {
  const response = await fetch(apiPath('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function login(input: LoginInput): Promise<User> {
  const response = await fetch(apiPath('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json() as Promise<User>;
}
