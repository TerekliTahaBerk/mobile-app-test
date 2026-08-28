import type {
  PathNode,
  PathNodeId,
  UnitId,
} from '@/modules/curriculum/domain/content-types';
import type { PathProgress } from '@/modules/progress/domain/progress-types';

/**
 * Turning the authored path plus the learner's record into what the unit screen
 * draws.
 *
 * Unlocking is derived, never stored: a node is available once every one of its
 * prerequisites is completed. That keeps a re-authored path correct on the next
 * launch instead of leaving a learner stranded behind a stale stored lock.
 */

export type PathStepStatus = 'available' | 'completed' | 'current' | 'locked';

export type PathStep = {
  kind: PathNode['kind'];
  node: PathNode;
  status: PathStepStatus;
};

export type UnitPath = {
  /** Completed nodes ÷ total nodes, 0–1. */
  completion: number;
  completedCount: number;
  steps: readonly PathStep[];
  unitId: UnitId;
};

export type UnitPathStatus = 'available' | 'completed' | 'locked' | 'started';

/**
 * Builds one unit's path. `steps` keep authored order; exactly one available
 * node — the first — is marked `current`, which is the node the screen raises
 * and labels BAŞLA.
 */
export function buildUnitPath(
  unitId: UnitId,
  nodes: readonly PathNode[],
  progressByNode: ReadonlyMap<PathNodeId, PathProgress>,
): UnitPath {
  const isCompleted = (id: PathNodeId) => progressByNode.get(id)?.status === 'completed';

  let currentClaimed = false;
  const steps = nodes.map((node): PathStep => {
    if (isCompleted(node.id)) {
      return { kind: node.kind, node, status: 'completed' };
    }

    const unlocked = node.prerequisiteIds.every(isCompleted);
    if (!unlocked) {
      return { kind: node.kind, node, status: 'locked' };
    }

    if (!currentClaimed) {
      currentClaimed = true;
      return { kind: node.kind, node, status: 'current' };
    }

    return { kind: node.kind, node, status: 'available' };
  });

  const completedCount = steps.filter((step) => step.status === 'completed').length;

  return {
    completedCount,
    completion: steps.length === 0 ? 0 : completedCount / steps.length,
    steps,
    unitId,
  };
}

export function unitStatus(path: UnitPath): UnitPathStatus {
  if (path.steps.length === 0) {
    return 'locked';
  }
  if (path.completedCount === path.steps.length) {
    return 'completed';
  }
  if (path.completedCount > 0) {
    return 'started';
  }

  return path.steps.some((step) => step.status !== 'locked') ? 'available' : 'locked';
}

/** The first node the learner can actually open, across the units in order. */
export function nextOpenStep(paths: readonly UnitPath[]): PathStep | null {
  for (const path of paths) {
    const step = path.steps.find((candidate) => candidate.status === 'current');
    if (step !== undefined) {
      return step;
    }
  }

  return null;
}
