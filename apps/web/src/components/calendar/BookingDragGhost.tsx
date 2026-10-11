type BookingDragGhostProps = {
  label: string;
  className?: string;
};

export function BookingDragGhost({ label, className = '' }: BookingDragGhostProps) {
  return (
    <div
      className={`h-full overflow-hidden border-2 border-dashed border-[color-mix(in_srgb,#201e1d_35%,transparent)] bg-[color-mix(in_srgb,#201e1d_5%,transparent)] ${className}`}
    >
      <p className="truncate px-2 pt-1 text-[12px] text-[#201e1d] opacity-50">{label}</p>
    </div>
  );
}
