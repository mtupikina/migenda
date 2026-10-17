import { format } from 'date-fns';
import { Table } from '@mantine/core';
import type { ReportRow } from '@migenda/shared';

import { formatBookedTime } from '../../schedule/formatBookedTime';
import { formatCompletedAt } from '../../schedule/reportFormat';
import { ReportStatusBadge } from './ReportStatusBadge';

type ReportRowLineProps = {
  row: ReportRow;
  showAssignee: boolean;
};

export function ReportRowLine({ row, showAssignee }: ReportRowLineProps) {
  const start = new Date(row.start);
  const end = new Date(row.end);

  return (
    <Table.Tr className="print:break-inside-avoid">
      <Table.Td className="whitespace-nowrap">{format(start, 'EEE, MMM d')}</Table.Td>
      <Table.Td className="whitespace-nowrap">
        {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
      </Table.Td>
      <Table.Td>
        <span className="font-semibold">{row.title}</span>
        {row.description ? (
          <span className="mt-0.5 block text-[13px] opacity-65">{row.description}</span>
        ) : null}
      </Table.Td>
      {showAssignee ? <Table.Td>{row.assignee.name}</Table.Td> : null}
      <Table.Td className="whitespace-nowrap">{formatBookedTime(row.plannedMinutes)}</Table.Td>
      <Table.Td>
        <ReportStatusBadge status={row.status} />
        {row.completedAt ? (
          <span className="mt-0.5 block text-[12px] opacity-55">{formatCompletedAt(row.completedAt)}</span>
        ) : null}
      </Table.Td>
      <Table.Td className="text-right">{row.notes > 0 ? row.notes : '—'}</Table.Td>
    </Table.Tr>
  );
}
