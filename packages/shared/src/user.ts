import { z } from 'zod';

import { notificationPreferencesSchema } from './profile';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  avatarUrl: z.string().optional(),
  hasPassword: z.boolean(),
  notifications: notificationPreferencesSchema,
});

export type User = z.infer<typeof userSchema>;

export function userFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return [user.firstName.trim(), user.lastName.trim()].filter(Boolean).join(' ');
}
