import { EVENT_TYPE_COLORS } from '@migenda/shared';

type EventTypeColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function EventTypeColorPicker({ value, onChange }: EventTypeColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2.5 border border-[color-mix(in_srgb,#201e1d_40%,transparent)] bg-surface p-3">
      {EVENT_TYPE_COLORS.map((color) => {
        const selected = color.value === value;
        return (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            aria-pressed={selected}
            className={`h-8 w-8 rounded-full border-2 ${selected ? 'border-accent' : 'border-transparent'}`}
            style={{ background: color.value }}
            onClick={() => onChange(color.value)}
          />
        );
      })}
    </div>
  );
}
