import { z } from 'zod';

export const publicStatsSchema = z.object({
  teams: z.number().int().nonnegative(),
  people: z.number().int().nonnegative(),
  events: z.number().int().nonnegative(),
  notes: z.number().int().nonnegative(),
});

export type PublicStats = z.infer<typeof publicStatsSchema>;
