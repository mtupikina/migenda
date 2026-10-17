import type { ReportActivity, ReportRow, ReportSummary } from '@migenda/shared';

export function completionRate(completed: number, notCompleted: number): number | null {
  const finished = completed + notCompleted;
  if (finished === 0) {
    return null;
  }
  return Math.round((completed / finished) * 100);
}

export function summarizeReport(rows: ReportRow[]): ReportSummary {
  const completed = rows.filter((row) => row.status === 'completed');
  const notCompleted = rows.filter((row) => row.status === 'not-completed').length;
  return {
    scheduled: rows.length,
    completed: completed.length,
    notCompleted,
    upcoming: rows.filter((row) => row.status === 'upcoming').length,
    completionRate: completionRate(completed.length, notCompleted),
    plannedMinutes: sumMinutes(rows),
    completedMinutes: sumMinutes(completed),
    notes: rows.reduce((total, row) => total + row.notes, 0),
  };
}

export function summarizeActivities(rows: ReportRow[]): ReportActivity[] {
  const byTitle = new Map<string, ReportRow[]>();
  for (const row of rows) {
    byTitle.set(row.title, [...(byTitle.get(row.title) ?? []), row]);
  }
  return [...byTitle.entries()]
    .map(([title, group]) => toActivity(title, group))
    .sort((left, right) => right.sessions - left.sessions || left.title.localeCompare(right.title));
}

function toActivity(title: string, group: ReportRow[]): ReportActivity {
  const completed = group.filter((row) => row.status === 'completed').length;
  const notCompleted = group.filter((row) => row.status === 'not-completed').length;
  return {
    title,
    sessions: group.length,
    completed,
    completionRate: completionRate(completed, notCompleted),
    plannedMinutes: sumMinutes(group),
  };
}

function sumMinutes(rows: ReportRow[]): number {
  return rows.reduce((total, row) => total + row.plannedMinutes, 0);
}
