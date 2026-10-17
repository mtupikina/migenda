import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

import { dashboardPanelClassName } from '../../classNames/shared';

type ReportErrorProps = {
  message: string;
};

export function ReportError({ message }: ReportErrorProps) {
  return (
    <div className={`${dashboardPanelClassName} flex flex-col items-center gap-4 px-8 py-12 text-center`}>
      <p className="m-0 text-[20px] font-extrabold leading-tight">We couldn&apos;t build this report</p>
      <p className="m-0 text-[14px] opacity-65">{message}</p>
      <Button component={Link} to="/reports">
        Back to Reports
      </Button>
    </div>
  );
}
