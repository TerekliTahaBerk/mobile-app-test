/**
 * XP policy, v1.
 *
 * XP measures activity, not knowledge. It is deliberately simple, auditable,
 * and completely separate from mastery — a learner can earn XP on material
 * they have not mastered, and mastering material awards no XP by itself.
 *
 * Product defaults are recorded in docs/GAMIFICATION.md.
 */
export type XpPolicy = {
  /** Awarded once per correctly answered scored exercise. */
  correctExercise: number;
  /** Awarded once when a lesson reaches `completed`. */
  lessonCompletion: number;
  /**
   * Awarded the first time a path level is completed. The lesson engine is
   * stateless across sessions, so it only ever *reports* this as a candidate;
   * the progression layer owns duplicate prevention.
   */
  firstPathLevelCompletion: number;
};

export const XP_POLICY_V1: XpPolicy = {
  correctExercise: 10,
  firstPathLevelCompletion: 25,
  lessonCompletion: 20,
};
