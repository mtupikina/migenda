import { dashboardPanelClassName } from '../../classNames/shared';

export function ReportNoRows() {
  return (
    <div className={`${dashboardPanelClassName} px-8 py-12 text-center`}>
      <p className="m-0 text-[20px] font-extrabold leading-tight">Nothing scheduled in this period</p>
      <p className="mb-0 mt-2 text-[14px] opacity-65">
        There are no events of this type between these dates. Try a different time period.
      </p>
    </div>
  );
}
