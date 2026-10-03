import { dashboardKickerClassName, dashboardPanelClassName } from '../../classNames/shared';

type DashboardDayStatProps = {
  label: string;
  count: number;
  caption: string;
  detail: string;
};

export function DashboardDayStat({ label, count, caption, detail }: DashboardDayStatProps) {
  return (
    <div className={`${dashboardPanelClassName} flex items-baseline gap-3 overflow-hidden px-4 py-2.5`}>
      <p className={`${dashboardKickerClassName} m-0 shrink-0`}>{label}</p>
      <p className="m-0 shrink-0 text-[22px] font-extrabold leading-none tracking-tight">{count}</p>
      <p className="m-0 shrink-0 text-[13px] leading-none opacity-65">{caption}</p>
      <p className="m-0 ml-auto min-w-0 truncate text-[13px] leading-none">{detail}</p>
    </div>
  );
}
