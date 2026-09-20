import type { User, LoginInput, RegisterInput } from '@migenda/shared';

export class RegisterError extends Error {
  constructor(readonly code: 'email_taken' | 'failed') {
    super(code);
    this.name = 'RegisterError';
  }
}

export async function register(input: RegisterInput): Promise<User> {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new RegisterError('email_taken');
  }

  if (!response.ok) {
    throw new RegisterError('failed');
  }

  return response.json() as Promise<User>;
}

export async function login(input: LoginInput): Promise<User> {
  const response = await fetch('/auth/login', {
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
