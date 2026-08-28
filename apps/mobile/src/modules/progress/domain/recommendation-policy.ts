import type { LessonId, PathNodeId, SkillId } from '@/modules/curriculum/domain/content-types';
import type { Mistake, ReviewItem, StoredSession } from '@/modules/progress/domain/progress-types';
import { isDue, sortDueItems } from '@/modules/progress/domain/review-policy';

/**
 * "What should the learner do next?"
 *
 * A pure, deterministic priority list — no ranking model, no randomness. Ties
 * break on the oldest due time and then on a stable ID, so the same state
 * always yields the same answer.
 */

export type RecommendationReason = 'mistake' | 'newLesson' | 'resume' | 'review';

export type Recommendation =
  | { kind: 'mistake'; reason: 'mistake'; skillId: SkillId }
  | { lessonId: LessonId; pathNodeId?: PathNodeId; reason: 'newLesson'; kind: 'lesson' }
  | {
      kind: 'resume';
      lessonId: LessonId;
      pathNodeId?: PathNodeId;
      reason: 'resume';
      sessionId: string;
    }
  | { kind: 'review'; reason: 'review'; skillId: SkillId }
  | { kind: 'none'; reason: 'newLesson' };

export type RecommendationInput = {
  activeSession: StoredSession | null;
  atMs: number;
  /** The next real path node the learner can open, if one exists. */
  nextLesson: { lessonId: LessonId; pathNodeId: PathNodeId } | null;
  reviewItems: readonly ReviewItem[];
  unresolvedMistakes: readonly Mistake[];
};

/**
 * Priority: remediate a mistake whose skill is due, then a due review, then an
 * unfinished session, then new material.
 *
 * A skill present in both the mistake list and the review ladder is offered
 * once, as a mistake — the two tables describe the same need from different
 * angles and must not queue it twice.
 */
export function recommendNext({
  activeSession,
  atMs,
  nextLesson,
  reviewItems,
  unresolvedMistakes,
}: RecommendationInput): Recommendation {
  const dueItems = sortDueItems(reviewItems.filter((item) => isDue(item, atMs)));
  const dueSkills = new Set(dueItems.map((item) => item.skillId));

  const dueMistakes = [...unresolvedMistakes]
    .filter((mistake) => dueSkills.has(mistake.skillId))
    .sort((a, b) => {
      const byCreated = Date.parse(a.createdAt) - Date.parse(b.createdAt);

      return byCreated !== 0 ? byCreated : a.id.localeCompare(b.id);
    });

  const firstMistake = dueMistakes[0];
  if (firstMistake !== undefined) {
    return { kind: 'mistake', reason: 'mistake', skillId: firstMistake.skillId };
  }

  const firstReview = dueItems[0];
  if (firstReview !== undefined) {
    return { kind: 'review', reason: 'review', skillId: firstReview.skillId };
  }

  if (activeSession !== null && activeSession.status === 'active') {
    return {
      kind: 'resume',
      lessonId: activeSession.lessonId,
      ...(activeSession.pathNodeId === undefined ? {} : { pathNodeId: activeSession.pathNodeId }),
      reason: 'resume',
      sessionId: activeSession.sessionId,
    };
  }

  if (nextLesson !== null) {
    return {
      kind: 'lesson',
      lessonId: nextLesson.lessonId,
      pathNodeId: nextLesson.pathNodeId,
      reason: 'newLesson',
    };
  }

  return { kind: 'none', reason: 'newLesson' };
}
