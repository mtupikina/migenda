/** Mongo filter for events that can have an occurrence starting in `[from, to)`. */
export function startsInWindow(from: Date, to: Date) {
  return {
    $or: [
      { weekdays: { $size: 0 }, start: { $gte: from, $lt: to } },
      { 'weekdays.0': { $exists: true }, start: { $lt: to } },
    ],
  };
}
