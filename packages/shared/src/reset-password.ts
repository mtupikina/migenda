import { z } from 'zod';

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

export const completePasswordResetSchema = z
  .object({
    password: z.string().min(1, 'Enter a password'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CompletePasswordResetInput = z.infer<typeof completePasswordResetSchema>;
