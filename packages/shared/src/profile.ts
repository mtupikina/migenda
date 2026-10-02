import { z } from 'zod';

export const notificationPreferencesSchema = z.object({
  emailShiftChanges: z.boolean(),
  emailSchedulingConflicts: z.boolean(),
  weeklySummaryDigest: z.boolean(),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

/** Personal info form (Profile card). */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Enter your first name'),
  lastName: z.string().min(1, 'Enter your last name'),
  email: z.string().email('Enter a valid email'),
  role: z.string(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/** Password form (Profile card). */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(1, 'Enter a new password'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Partial update body for PATCH /api/profile. */
export const patchProfileSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    notifications: notificationPreferencesSchema.optional(),
    avatarUrl: z.string().max(400_000, 'Image is too large').optional(),
    password: changePasswordSchema.optional(),
  })
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined ||
      data.role !== undefined ||
      data.notifications !== undefined ||
      data.avatarUrl !== undefined ||
      data.password !== undefined,
    { message: 'No profile fields to update' },
  );

export type PatchProfileInput = z.infer<typeof patchProfileSchema>;
