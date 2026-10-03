import { format } from 'date-fns';

export function formatEventLine(title: string, typeName: string, startIso: string): string {
  return `${title} · ${typeName} · ${format(new Date(startIso), 'HH:mm')}`;
}
