import type {
  User,
  LoginInput,
  RegisterInput,
  ResetPasswordRequestInput,
} from '@migenda/shared';

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

export class PasswordResetError extends Error {
  constructor(readonly code: 'invalid_token' | 'failed') {
    super(code);
    this.name = 'PasswordResetError';
  }
}

export async function requestPasswordReset(input: ResetPasswordRequestInput): Promise<void> {
  const response = await fetch('/auth/forgot-password', {
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
  const response = await fetch('/auth/reset-password', {
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
