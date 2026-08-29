import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { FIRST_TURKISH_STATES_UNIT_ID } from '@/modules/curriculum/content/tyt-draft-bundle';
import {
  buildUnitPath,
  nextOpenStep,
  unitStatus,
} from '@/modules/curriculum/domain/path-progression';
import type { PathProgress } from '@/modules/progress/domain/progress-types';

const index = getContentIndex();
const nodes = index.getUnitPath(FIRST_TURKISH_STATES_UNIT_ID);

function completed(...ids: readonly string[]): ReadonlyMap<string, PathProgress> {
  return new Map(
    ids.map((id) => [
      id,
      { completionCount: 1, pathNodeId: id, status: 'completed' as const },
    ]),
  );
}

describe('unit path progression', () => {
  it('locks every node whose prerequisites are unmet', () => {
    const path = buildUnitPath(FIRST_TURKISH_STATES_UNIT_ID, nodes, new Map());

    // The first node of this unit depends on the previous unit's checkpoint.
    expect(path.steps.every((step) => step.status === 'locked')).toBe(true);
    expect(unitStatus(path)).toBe('locked');
  });

  it('marks exactly one available node as the current step', () => {
    const path = buildUnitPath(
      FIRST_TURKISH_STATES_UNIT_ID,
      nodes,
      completed('path.history.medieval-world.02'),
    );

    expect(path.steps.filter((step) => step.status === 'current')).toHaveLength(1);
    expect(path.steps[0]?.status).toBe('current');
    expect(unitStatus(path)).toBe('available');
  });

  it('advances the current step as nodes are completed', () => {
    const path = buildUnitPath(
      FIRST_TURKISH_STATES_UNIT_ID,
      nodes,
      completed(
        'path.history.medieval-world.02',
        'path.history.first-turkish-states.01',
        'path.history.first-turkish-states.02',
      ),
    );

    expect(path.completedCount).toBe(2);
    expect(path.steps.find((step) => step.status === 'current')?.node.id).toBe(
      'path.history.first-turkish-states.03',
    );
    expect(unitStatus(path)).toBe('started');
  });

  it('reports a finished unit once every node is done', () => {
    const path = buildUnitPath(
      FIRST_TURKISH_STATES_UNIT_ID,
      nodes,
      completed('path.history.medieval-world.02', ...nodes.map((node) => node.id)),
    );

    expect(path.completion).toBe(1);
    expect(unitStatus(path)).toBe('completed');
  });

  it('finds the first openable step across units in order', () => {
    const paths = index.bundle.subjects
      .find((subject) => subject.unitIds.length > 0)!
      .unitIds.map((unitId) => buildUnitPath(unitId, index.getUnitPath(unitId), new Map()));

    expect(nextOpenStep(paths)?.node.id).toBe('path.history.time.01');
  });

  it('returns nothing when there is no openable step left', () => {
    expect(nextOpenStep([])).toBeNull();
  });

  it('unlocks the first node of a later unit only after the previous unit checkpoint', () => {
    const subject = index.bundle.subjects.find((candidate) => candidate.id === 'tyt.history')!;
    const firstTwoUnits = subject.unitIds.slice(0, 2);
    const completedFirstUnit = index.getUnitPath(firstTwoUnits[0]!).map((node) => node.id);
    const paths = firstTwoUnits.map((unitId) =>
      buildUnitPath(unitId, index.getUnitPath(unitId), completed(...completedFirstUnit)),
    );

    expect(paths[0]?.completion).toBe(1);
    expect(paths[1]?.steps[0]?.status).toBe('current');
    expect(nextOpenStep(paths)?.node.id).toBe('path.history.first-human-periods.01');
  });
});
