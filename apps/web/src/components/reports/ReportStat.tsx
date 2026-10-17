import { reportStatClassName } from '../../classNames/reports';

type ReportStatProps = {
  label: string;
  value: string;
};

export function ReportStat({ label, value }: ReportStatProps) {
  return (
    <div className={reportStatClassName}>
      <p className="m-0 text-[11px] uppercase tracking-[0.08em] opacity-60">{label}</p>
      <p className="m-0 mt-1 text-[24px] font-extrabold leading-tight">{value}</p>
    </div>
  );
}
