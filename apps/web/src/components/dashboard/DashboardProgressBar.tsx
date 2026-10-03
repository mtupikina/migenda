type DashboardProgressBarProps = {
  done: number;
  total: number;
};

export function DashboardProgressBar({ done, total }: DashboardProgressBarProps) {
  const percent = total === 0 ? 0 : (done / total) * 100;

  return (
    <div className="h-2 flex-1 bg-[color-mix(in_srgb,#201e1d_12%,white)]">
      <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}
