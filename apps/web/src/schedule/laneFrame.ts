import type { Lane } from './overlapLanes';

/** Where a block sits across its column, leaving `inset` pixels free on each side. */
export function laneFrame(lane: Lane, inset: number): { left: string; width: string } {
  const share = 100 / lane.count;
  return {
    left: `calc(${lane.index * share}% + ${inset}px)`,
    width: `calc(${share}% - ${inset * 2}px)`,
  };
}
