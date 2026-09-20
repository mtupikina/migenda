import { z } from 'zod';

export const createAccountSchema = z
  .object({
    name: z.string().min(1, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Enter a password'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.agreeToTerms, {
    message: 'You must agree to the Terms and Privacy Policy',
    path: ['agreeToTerms'],
  });

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
