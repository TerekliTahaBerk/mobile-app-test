import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import {
  isScoredKind,
  type ExerciseDefinition,
  type ExerciseId,
  type LessonId,
  type SkillId,
  type TopicId,
} from '@/modules/curriculum/domain/content-types';
import {
  latestAttemptByExercise,
  rankByHistory,
  type ExerciseHistory,
} from '@/modules/learning/domain/exercise-selection';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';
import type { MainTopicPerformance } from '@/modules/progress/domain/topic-performance';

/**
 * The daily plan.
 *
 * One explainable set of questions for today, mixed across subtopics rather
 * than blocked by topic: a classroom study of retrieval practice found
 * interleaved retrieval beat blocked study on a delayed test, and the whole
 * point of a daily set is what survives to the exam.
 *
 * The plan is a drill, not a path step. It never carries a path node, so
 * finishing it can neither complete nor unlock curriculum a learner has not
 * actually worked through in Öğren.
 */

export type DailyPlanPartKind = 'newMaterial' | 'refresh' | 'review' | 'weakTopic';

export type DailyPlanPart = {
  exercises: readonly ExerciseDefinition[];
  kind: DailyPlanPartKind;
  /** Learner-facing subtopic names this part draws from, in selection order. */
  topicTitles: readonly string[];
};

export type DailyPlan = {
  /** Every question in the order it will be asked, interleaved across subtopics. */
  exercises: readonly ExerciseDefinition[];
  /** Only the parts that could actually be filled. */
  parts: readonly DailyPlanPart[];
  /** Distinct subtopics the plan touches. */
  topicCount: number;
};

export type DailyPlanInput = {
  attempts: readonly StoredAttempt[];
  /** Skills whose review has come due, most overdue first. */
  dueSkillIds: readonly SkillId[];
  index: ContentIndex;
  /** Lessons the learner may open, in path order. */
  newLessonIds: readonly LessonId[];
  /** All-time topic report; weak and stale subtopics are read from it. */
  topics: readonly MainTopicPerformance[];
};

/** The shape of a full day, before the learner's own record trims it. */
export const DAILY_PLAN_QUOTAS: Readonly<Record<DailyPlanPartKind, number>> = {
  newMaterial: 2,
  refresh: 2,
  review: 3,
  weakTopic: 5,
};

export const DAILY_PLAN_TARGET = 12;

/** A strength this long unmeasured is worth one confirming question. */
const REFRESH_AFTER_DAYS = 14;

/**
 * Builds today's plan. Every bucket is filled from the learner's own record and
 * may come up short; the plan then reports what it actually holds rather than
 * padding a bucket to look complete. Only new material tops the day back up to
 * the target, because it is the one source that is not evidence-bound.
 */
export function buildDailyPlan(input: DailyPlanInput): DailyPlan {
  const history = latestAttemptByExercise(input.attempts);
  const taken = new Set<ExerciseId>();
  const subtopics = input.topics.flatMap((topic) => topic.subtopics);

  const weak = subtopics
    .filter(
      (subtopic) =>
        subtopic.band === 'needsPractice' ||
        (subtopic.band === 'developing' && subtopic.wrongAnswers > 0),
    )
    .sort(
      (left, right) =>
        left.accuracy - right.accuracy ||
        right.totalAttempts - left.totalAttempts ||
        left.id.localeCompare(right.id),
    )
    .map((subtopic) => subtopic.id);

  const stale = subtopics
    .filter(
      (subtopic) =>
        subtopic.band === 'strong' && subtopic.daysSinceLastAttempt >= REFRESH_AFTER_DAYS,
    )
    .sort(
      (left, right) =>
        right.daysSinceLastAttempt - left.daysSinceLastAttempt || left.id.localeCompare(right.id),
    )
    .map((subtopic) => subtopic.id);

  const parts: DailyPlanPart[] = [
    partFor('weakTopic', weak.map((topicId) => forTopic(topicId, input.index))),
    partFor(
      'review',
      input.dueSkillIds.map((skillId) => forSkill(skillId, input.index)),
    ),
    partFor('refresh', stale.map((topicId) => forTopic(topicId, input.index))),
    partFor('newMaterial', [forNewLessons(input.newLessonIds, input.index, history)]),
  ];

  const shortfall = DAILY_PLAN_TARGET - parts.reduce((sum, part) => sum + part.exercises.length, 0);
  if (shortfall > 0) {
    const extra = drawRoundRobin(
      [forNewLessons(input.newLessonIds, input.index, history)],
      history,
      shortfall,
      taken,
    );
    const newMaterial = parts[3]!;
    parts[3] = {
      ...newMaterial,
      exercises: [...newMaterial.exercises, ...extra],
      topicTitles: titlesOf([...newMaterial.exercises, ...extra], input.index),
    };
  }

  const filled = parts.filter((part) => part.exercises.length > 0);
  const exercises = interleave(filled, input.index);

  return {
    exercises,
    parts: filled,
    topicCount: new Set(exercises.map((exercise) => topicKeyOf(exercise.id, input.index))).size,
  };

  function partFor(
    kind: DailyPlanPartKind,
    sources: readonly (readonly ExerciseDefinition[])[],
  ): DailyPlanPart {
    const chosen = drawRoundRobin(sources, history, DAILY_PLAN_QUOTAS[kind], taken);

    return { exercises: chosen, kind, topicTitles: titlesOf(chosen, input.index) };
  }
}

/**
 * Takes one question from each source in turn, so a bucket drawn from several
 * subtopics is already mixed before the parts are interleaved.
 */
function drawRoundRobin(
  sources: readonly (readonly ExerciseDefinition[])[],
  history: ExerciseHistory,
  limit: number,
  taken: Set<ExerciseId>,
): readonly ExerciseDefinition[] {
  const queues = sources.map((source) => [...rankByHistory(source, history)]);
  const chosen: ExerciseDefinition[] = [];

  while (chosen.length < limit && queues.some((queue) => queue.length > 0)) {
    let progressed = false;
    for (const queue of queues) {
      if (chosen.length >= limit) {
        break;
      }
      const next = queue.shift();
      if (next === undefined) {
        continue;
      }
      progressed = true;
      if (taken.has(next.id)) {
        continue;
      }
      taken.add(next.id);
      chosen.push(next);
    }
    if (!progressed) {
      break;
    }
  }

  return chosen;
}

/**
 * Orders the whole day so consecutive questions come from different subtopics
 * whenever the remaining questions allow it. Questions are regrouped by
 * subtopic — the parts explain the day, they do not dictate its sequence — and
 * the largest remaining subtopic that differs from the last one goes next, so
 * an unavoidable repeat is pushed to the end rather than left in the middle.
 */
function interleave(
  parts: readonly DailyPlanPart[],
  index: ContentIndex,
): readonly ExerciseDefinition[] {
  const buckets = new Map<string, ExerciseDefinition[]>();
  for (const part of parts) {
    for (const exercise of part.exercises) {
      const key = topicKeyOf(exercise.id, index);
      const bucket = buckets.get(key);
      if (bucket === undefined) {
        buckets.set(key, [exercise]);
        continue;
      }
      bucket.push(exercise);
    }
  }

  const queues = [...buckets.entries()].map(([key, exercises]) => ({ exercises, key }));
  const order: ExerciseDefinition[] = [];
  let lastKey: string | null = null;

  while (queues.some((queue) => queue.exercises.length > 0)) {
    const available = queues.filter((queue) => queue.exercises.length > 0);
    const different = available.filter((queue) => queue.key !== lastKey);
    const pool = different.length > 0 ? different : available;
    const picked = pool.reduce((best, queue) =>
      queue.exercises.length > best.exercises.length ? queue : best,
    );

    order.push(picked.exercises.shift()!);
    lastKey = picked.key;
  }

  return order;
}

/** Every scored question measuring one subtopic. */
function forTopic(topicId: TopicId, index: ContentIndex): readonly ExerciseDefinition[] {
  const skillIds = new Set(index.getTopic(topicId).skillIds);

  return index.bundle.exercises.filter(
    (exercise) =>
      isScoredKind(exercise.kind) && exercise.skillIds.some((skillId) => skillIds.has(skillId)),
  );
}

/** Every scored question measuring one due skill. */
function forSkill(skillId: SkillId, index: ContentIndex): readonly ExerciseDefinition[] {
  return index.bundle.exercises.filter(
    (exercise) => isScoredKind(exercise.kind) && exercise.skillIds.includes(skillId),
  );
}

/**
 * New material is what the learner has not answered before, taken in path
 * order. A question already in their history is not new, whatever else it is.
 */
function forNewLessons(
  lessonIds: readonly LessonId[],
  index: ContentIndex,
  history: ExerciseHistory,
): readonly ExerciseDefinition[] {
  return lessonIds.flatMap((lessonId) =>
    index
      .getLessonExercises(lessonId)
      .filter((exercise) => isScoredKind(exercise.kind) && !history.has(exercise.id)),
  );
}

function titlesOf(
  exercises: readonly ExerciseDefinition[],
  index: ContentIndex,
): readonly string[] {
  const titles: string[] = [];
  for (const exercise of exercises) {
    for (const topic of index.getExerciseTaxonomy(exercise.id).subtopics) {
      if (!titles.includes(topic.title)) {
        titles.push(topic.title);
      }
    }
  }

  return titles;
}

/** The subtopic a question is filed under for interleaving purposes. */
function topicKeyOf(exerciseId: ExerciseId, index: ContentIndex): string {
  return index.getExerciseTaxonomy(exerciseId).subtopics[0]?.id ?? exerciseId;
}
