export type Lane = {
  /** Which column the item sits in, starting at 0 on the left. */
  index: number;
  /** How many columns the group of overlapping items needs. */
  count: number;
};

type Span = {
  start: string;
  end: string;
};

type Placed<T> = {
  item: T;
  index: number;
};

const ALONE: Lane = { index: 0, count: 1 };

/** The lane for an item that overlaps nothing, or one that was not laid out. */
export function laneOf<T>(lanes: Map<T, Lane>, item: T): Lane {
  return lanes.get(item) ?? ALONE;
}

/**
 * Puts items that overlap in time side by side. Items that overlap nothing get the whole width.
 * Overlaps chain: if A overlaps B and B overlaps C, all three share one group of columns.
 */
export function overlapLanes<T extends Span>(items: T[]): Map<T, Lane> {
  const sorted = [...items].sort(
    (left, right) => Date.parse(left.start) - Date.parse(right.start) || Date.parse(right.end) - Date.parse(left.end),
  );
  const lanes = new Map<T, Lane>();
  let group: Placed<T>[] = [];
  let laneEnds: number[] = [];
  let groupEnd = Number.NEGATIVE_INFINITY;

  const closeGroup = () => {
    for (const { item, index } of group) {
      lanes.set(item, { index, count: laneEnds.length });
    }
    group = [];
    laneEnds = [];
  };

  for (const item of sorted) {
    const start = Date.parse(item.start);
    const end = Date.parse(item.end);
    if (start >= groupEnd) {
      closeGroup();
    }
    const free = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    const index = free === -1 ? laneEnds.length : free;
    laneEnds[index] = end;
    group.push({ item, index });
    groupEnd = Math.max(groupEnd, end);
  }
  closeGroup();
  return lanes;
}
