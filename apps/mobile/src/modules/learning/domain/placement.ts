import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import {
  isScoredKind,
  type ExerciseDefinition,
  type TopicId,
} from '@/modules/curriculum/domain/content-types';

/**
 * The starting diagnostic.
 *
 * A first run should not open on an empty performance screen, so a learner who
 * asks to be measured answers one short set sampled across the whole authored
 * curriculum.
 *
 * Its length follows from coverage rather than from a round number: each
 * subtopic contributes up to three questions — the evidence bar the topic
 * report uses before it will label anything — and no more, so no single
 * subtopic can dominate the resulting map. A subtopic with less material than
 * that contributes what it has.
 */

/** Enough answers for a subtopic to be labelled rather than left undecided. */
const PER_SUBTOPIC = 3;

/** However broad the curriculum grows, the diagnostic stays one sitting. */
const MAX_QUESTIONS = 20;

export type Placement = {
  exercises: readonly ExerciseDefinition[];
  /** The subtopics the resulting map can speak about, in asking order. */
  topicIds: readonly TopicId[];
};

/**
 * Samples across every main topic and subtopic that has scored material,
 * easiest question first inside each subtopic and never twice in a row from the
 * same one. Deterministic: the same bundle always produces the same diagnostic.
 */
export function assemblePlacement(index: ContentIndex): Placement {
  const queues = index.bundle.units
    .flatMap((unit) => unit.topicIds)
    .map((topicId) => ({
      exercises: scoredFor(topicId, index).slice(0, PER_SUBTOPIC),
      topicId,
    }))
    .filter((queue) => queue.exercises.length > 0);

  if (queues.length === 0) {
    throw new Error('Seviye tespiti için puanlanan alıştırma bulunamadı.');
  }

  const target = Math.min(
    MAX_QUESTIONS,
    queues.reduce((sum, queue) => sum + queue.exercises.length, 0),
  );

  const exercises: ExerciseDefinition[] = [];
  const topicIds: TopicId[] = [];
  while (exercises.length < target && queues.some((queue) => queue.exercises.length > 0)) {
    let progressed = false;
    for (const queue of queues) {
      if (exercises.length >= target) {
        break;
      }
      const next = queue.exercises.shift();
      if (next === undefined) {
        continue;
      }
      progressed = true;
      exercises.push(next);
      if (!topicIds.includes(queue.topicId)) {
        topicIds.push(queue.topicId);
      }
    }
    if (!progressed) {
      break;
    }
  }

  return { exercises, topicIds };
}

/** Scored questions measuring a subtopic, accessible ones first. */
function scoredFor(topicId: TopicId, index: ContentIndex): readonly ExerciseDefinition[] {
  const skillIds = new Set(index.getTopic(topicId).skillIds);

  return index.bundle.exercises
    .filter(
      (exercise) =>
        isScoredKind(exercise.kind) && exercise.skillIds.some((skillId) => skillIds.has(skillId)),
    )
    .sort((left, right) => left.difficulty - right.difficulty || left.id.localeCompare(right.id));
}
