import type { AssigneeOption, Occurrence, ReportRow, ReportStatus } from '@migenda/shared';

import { exceptionKey } from '../events/place-occurrence';

export type ReportEventRecord = {
  description: string;
  assigneeId: string;
};

export type ReportExceptionRecord = {
  description?: string;
  completedAt: Date | null;
};

export type BuildRowsInput = {
  placed: Occurrence[];
  events: Map<string, ReportEventRecord>;
  exceptions: Map<string, ReportExceptionRecord>;
  notes: Map<string, number>;
  assignees: Map<string, AssigneeOption>;
  now: Date;
};

export function buildReportRows(input: BuildRowsInput): ReportRow[] {
  return input.placed.flatMap((item) => {
    const event = input.events.get(item.eventId);
    if (!event) {
      return [];
    }
    const key = exceptionKey(item.eventId, new Date(item.start));
    const exception = input.exceptions.get(key);
    return [
      {
        eventId: item.eventId,
        occurrenceStart: item.start,
        start: item.start,
        end: item.end,
        title: item.title,
        description: exception?.description ?? event.description,
        plannedMinutes: minutesBetween(item.start, item.end),
        status: statusOf(item, input.now),
        completedAt: exception?.completedAt?.toISOString() ?? null,
        notes: input.notes.get(key) ?? 0,
        assignee: input.assignees.get(event.assigneeId) ?? { id: event.assigneeId, name: '' },
      },
    ];
  });
}

function statusOf(item: Occurrence, now: Date): ReportStatus {
  if (item.completed) {
    return 'completed';
  }
  if (new Date(item.end) > now) {
    return 'upcoming';
  }
  return 'not-completed';
}

function minutesBetween(startIso: string, endIso: string): number {
  const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
  return Math.max(minutes, 0);
}
