type EventDetailsFieldProps = {
  label: string;
  value: string;
};

export function EventDetailsField({ label, value }: EventDetailsFieldProps) {
  return (
    <div>
      <p className="mb-[5px] text-[12px] font-normal text-[color-mix(in_srgb,#201e1d_70%,transparent)]">{label}</p>
      <p className="m-0 whitespace-pre-wrap text-[14px]">{value}</p>
    </div>
  );
}
