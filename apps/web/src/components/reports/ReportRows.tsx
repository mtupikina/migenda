import { Table } from '@mantine/core';
import type { ReportRow } from '@migenda/shared';

import { reportTableClassNames } from '../../classNames/reports';
import { ReportRowLine } from './ReportRowLine';

type ReportRowsProps = {
  rows: ReportRow[];
  showAssignee: boolean;
};

export function ReportRows({ rows, showAssignee }: ReportRowsProps) {
  return (
    <Table classNames={reportTableClassNames} highlightOnHover aria-label="Events">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Date</Table.Th>
          <Table.Th>Time</Table.Th>
          <Table.Th>Activity</Table.Th>
          {showAssignee ? <Table.Th>Assignee</Table.Th> : null}
          <Table.Th>Planned</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th className="text-right">Notes</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <ReportRowLine key={`${row.eventId}:${row.occurrenceStart}`} row={row} showAssignee={showAssignee} />
        ))}
      </Table.Tbody>
    </Table>
  );
}
