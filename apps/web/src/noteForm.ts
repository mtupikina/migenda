import { z } from 'zod';
import { EVENT_DESCRIPTION_MAX } from '@migenda/shared';

export const noteFormSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Enter a note')
    .max(EVENT_DESCRIPTION_MAX, 'Use 1000 characters or fewer'),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
