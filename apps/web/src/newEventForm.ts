import { z } from 'zod';
import { addHours, format } from 'date-fns';
import { EVENT_DESCRIPTION_MAX, EVENT_TITLE_MAX } from '@migenda/shared';

export const newEventFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Enter a title').max(EVENT_TITLE_MAX, 'Use 50 characters or fewer'),
    typeId: z.string().min(1, 'Select a type'),
    assigneeId: z.string().min(1, 'Select an assignee'),
    start: z.string().min(1, 'Enter a start'),
    end: z.string().min(1, 'Enter an end'),
    weekdays: z.array(z.number().int().min(0).max(6)),
    until: z.string(),
    description: z.string().max(EVENT_DESCRIPTION_MAX, 'Use 1000 characters or fewer'),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.start);
    const end = new Date(value.end);
    const startInvalid = Number.isNaN(start.getTime());
    const endInvalid = Number.isNaN(end.getTime());
    if (startInvalid) {
      ctx.addIssue({ code: 'custom', path: ['start'], message: 'Enter a start' });
    }
    if (endInvalid) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'Enter an end' });
    }
    if (!startInvalid && !endInvalid && end <= start) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'End must be after the start' });
    }
    if (value.until && value.weekdays.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['weekdays'],
        message: 'Select at least one day to repeat',
      });
    }
    if (value.until && !startInvalid && value.until < format(start, 'yyyy-MM-dd')) {
      ctx.addIssue({
        code: 'custom',
        path: ['until'],
        message: 'Until date must be on or after the start',
      });
    }
  });

export type NewEventFormValues = z.infer<typeof newEventFormSchema>;

export function defaultEventRange(): { start: string; end: string } {
  const start = new Date();
  start.setSeconds(0, 0);
  return {
    start: format(start, "yyyy-MM-dd'T'HH:mm"),
    end: format(addHours(start, 1), "yyyy-MM-dd'T'HH:mm"),
  };
}
