import { Table } from '@mantine/core';
import type { ReportActivity } from '@migenda/shared';

import { reportTableClassNames } from '../../classNames/reports';
import { formatBookedTime } from '../../schedule/formatBookedTime';
import { formatRate } from '../../schedule/reportFormat';

type ReportActivitiesProps = {
  activities: ReportActivity[];
};

export function ReportActivities({ activities }: ReportActivitiesProps) {
  return (
    <section aria-label="By activity" className="mb-8">
      <h2 className="mb-2 mt-0 text-[18px] font-extrabold leading-tight">By activity</h2>
      <Table classNames={reportTableClassNames} highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Activity</Table.Th>
            <Table.Th className="text-right">Events</Table.Th>
            <Table.Th className="text-right">Completed</Table.Th>
            <Table.Th className="text-right">Rate</Table.Th>
            <Table.Th className="text-right">Planned</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {activities.map((activity) => (
            <Table.Tr key={activity.title}>
              <Table.Td className="font-semibold">{activity.title}</Table.Td>
              <Table.Td className="text-right">{activity.sessions}</Table.Td>
              <Table.Td className="text-right">{activity.completed}</Table.Td>
              <Table.Td className="text-right">{formatRate(activity.completionRate)}</Table.Td>
              <Table.Td className="whitespace-nowrap text-right">{formatBookedTime(activity.plannedMinutes)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
}
