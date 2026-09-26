import { createHash, randomBytes } from 'node:crypto';

export const PASSWORD_RESET_MS = 60 * 60 * 1000;

export function createPasswordResetToken() {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashPasswordResetToken(token);
  return { token, tokenHash };
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
