import firstTurkishStates from '@/modules/curriculum/content/data/units/tyt.history.first-turkish-states.json';
import medievalWorld from '@/modules/curriculum/content/data/units/tyt.history.medieval-world.json';
import timeAndHistory from '@/modules/curriculum/content/data/units/tyt.history.time-and-history.json';

/**
 * One authored unit's records, as they sit on disk.
 *
 * Deliberately typed as collections of `unknown`: JSON has no types, and
 * pretending otherwise here would move a real risk out of the validator, which
 * is the only thing that actually checks the shape.
 */
export type AuthoredUnitFile = {
  concepts: readonly unknown[];
  exercises: readonly unknown[];
  lessons: readonly unknown[];
  pathNodes: readonly unknown[];
  skills: readonly unknown[];
  topics: readonly unknown[];
  unitId: string;
};

/**
 * Authored units, one data file each. Generated from the content directory by
 * the studio; add a unit there rather than editing this list by hand.
 */
export const UNIT_FILES: readonly AuthoredUnitFile[] = [
  firstTurkishStates,
  medievalWorld,
  timeAndHistory,
];
