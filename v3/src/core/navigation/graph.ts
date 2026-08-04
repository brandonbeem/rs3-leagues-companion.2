import type { LocationId } from '../ids';
import type { TravelEdge, TravelRequirement } from '../world/types';

export interface PathResult {
  locationIds: LocationId[];
  edges: TravelEdge[];
  totalSeconds: number;
}

export type RequirementCheck = (requirement: TravelRequirement) => boolean;

function expandEdges(edges: TravelEdge[]): TravelEdge[] {
  return edges.flatMap((edge) => {
    if (!edge.bidirectional) return [edge];
    return [
      edge,
      {
        ...edge,
        from: edge.to,
        to: edge.from,
      },
    ];
  });
}

export function shortestPath(
  edges: TravelEdge[],
  start: LocationId,
  target: LocationId,
  canUseRequirement: RequirementCheck = () => true,
): PathResult | null {
  if (start === target) {
    return { locationIds: [start], edges: [], totalSeconds: 0 };
  }

  const usableEdges = expandEdges(edges).filter((edge) => edge.requirements.every(canUseRequirement));
  const nodes = new Set<LocationId>([start, target]);
  usableEdges.forEach((edge) => {
    nodes.add(edge.from);
    nodes.add(edge.to);
  });

  const distances = new Map<LocationId, number>();
  const previous = new Map<LocationId, { locationId: LocationId; edge: TravelEdge }>();
  const unvisited = new Set(nodes);
  nodes.forEach((node) => distances.set(node, Number.POSITIVE_INFINITY));
  distances.set(start, 0);

  while (unvisited.size > 0) {
    let current: LocationId | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    unvisited.forEach((node) => {
      const distance = distances.get(node) ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        current = node;
        currentDistance = distance;
      }
    });

    if (!current || !Number.isFinite(currentDistance)) break;
    if (current === target) break;

    unvisited.delete(current);

    usableEdges
      .filter((edge) => edge.from === current)
      .forEach((edge) => {
        const alternative = currentDistance + edge.seconds;
        if (alternative < (distances.get(edge.to) ?? Number.POSITIVE_INFINITY)) {
          distances.set(edge.to, alternative);
          previous.set(edge.to, { locationId: current as LocationId, edge });
        }
      });
  }

  const totalSeconds = distances.get(target) ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(totalSeconds)) return null;

  const locationIds: LocationId[] = [target];
  const pathEdges: TravelEdge[] = [];
  let cursor = target;

  while (cursor !== start) {
    const step = previous.get(cursor);
    if (!step) return null;
    pathEdges.unshift(step.edge);
    locationIds.unshift(step.locationId);
    cursor = step.locationId;
  }

  return { locationIds, edges: pathEdges, totalSeconds };
}

export function connectedEdges(edges: TravelEdge[], locationId: LocationId): TravelEdge[] {
  return expandEdges(edges).filter((edge) => edge.from === locationId);
}
