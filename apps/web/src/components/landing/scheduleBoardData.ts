export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const TIMES = ['08:00', '10:00', '12:00', '14:00', '16:00'] as const;

export type BoardEventTone = 'ink' | 'accent' | 'open';

export type BoardEvent = {
  col: number;
  row: number;
  rows: number;
  label: string;
  tone: BoardEventTone;
};

export const BOARD_EVENTS: readonly BoardEvent[] = [
  { col: 0, row: 0, rows: 2, label: 'Coffee Time', tone: 'ink' },
  { col: 1, row: 1, rows: 3, label: 'Floor shift', tone: 'ink' },
  { col: 2, row: 0, rows: 3, label: 'Conflict — review', tone: 'accent' },
  { col: 3, row: 2, rows: 3, label: 'Client call', tone: 'ink' },
  { col: 4, row: 1, rows: 2, label: 'Warehouse', tone: 'ink' },
  { col: 5, row: 0, rows: 2, label: 'Open', tone: 'open' },
];
