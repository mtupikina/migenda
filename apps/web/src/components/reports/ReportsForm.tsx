import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group, Stack } from '@mantine/core';

import {
  REPORT_PERIODS,
  reportRangeSchema,
  type EventType,
  type ReportPeriod,
  type ReportRange,
} from '@migenda/shared';

import { generatedReportPath } from '../../schedule/generatedReportPath';
import { resolveReportRange } from '../../schedule/reportRange';
import { ReportCustomRange } from './ReportCustomRange';
import { ReportOptionGroup } from './ReportOptionGroup';

type ReportsFormProps = {
  types: EventType[];
};

export function ReportsForm({ types }: ReportsFormProps) {
  const navigate = useNavigate();
  const [pickedTypeId, setPickedTypeId] = useState<string | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>(REPORT_PERIODS[0].id);
  const [custom, setCustom] = useState<ReportRange>({ from: '', to: '' });
  const typeId = pickedTypeId ?? types[0].id;
  const typeOptions = types.map((type) => ({ id: type.id, label: type.name }));
  const parsed = reportRangeSchema.safeParse(resolveReportRange(period, custom, new Date()));
  const bothDatesPicked = custom.from !== '' && custom.to !== '';
  const showEndError = period === 'custom-range' && bothDatesPicked && !parsed.success;

  function generate() {
    if (parsed.success) {
      void navigate(generatedReportPath(typeId, parsed.data));
    }
  }

  return (
    <Stack gap={24}>
      <ReportOptionGroup
        label="Report by Type"
        options={typeOptions}
        value={typeId}
        onChange={setPickedTypeId}
      />
      <ReportOptionGroup
        label="Time Period"
        options={REPORT_PERIODS}
        value={period}
        onChange={setPeriod}
      />
      {period === 'custom-range' ? (
        <ReportCustomRange
          value={custom}
          onChange={setCustom}
          error={showEndError ? parsed.error.issues[0]?.message : undefined}
        />
      ) : null}
      <Group justify="flex-end">
        <Button disabled={!parsed.success} onClick={generate}>
          Generate report
        </Button>
      </Group>
    </Stack>
  );
}
