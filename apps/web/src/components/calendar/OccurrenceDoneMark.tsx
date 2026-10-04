import { CircleCheck } from 'lucide-react';

type OccurrenceDoneMarkProps = {
  size?: number;
};

export function OccurrenceDoneMark({ size = 14 }: OccurrenceDoneMarkProps) {
  return <CircleCheck size={size} className="shrink-0" aria-label="Completed" />;
}
