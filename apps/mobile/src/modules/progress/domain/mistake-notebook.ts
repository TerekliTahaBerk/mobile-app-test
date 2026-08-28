import type { ContentIndex } from '@/modules/curriculum/domain/content-index';
import type {
  ExerciseId,
  SkillId,
  Timestamp,
  TopicId,
} from '@/modules/curriculum/domain/content-types';
import { parseStoredAnswer } from '@/modules/learning/domain/answers';
import {
  describeCorrectAnswer,
  describeGivenAnswer,
  describePrompt,
} from '@/modules/learning/domain/evaluator-registry';
import type { Mistake, StoredAttempt } from '@/modules/progress/domain/progress-types';

/**
 * The mistake notebook.
 *
 * A read model over the durable mistake records and the answer log. It only
 * reports; it cannot close a mistake. A mistake is closed by a clean repeat
 * answer on the same skill, which the completion write already does — so the
 * notebook has no way for a learner to erase evidence of what they missed.
 */

export type MistakeEntryStatus = 'learned' | 'open';

export type MistakeEntry = {
  correctAnswer: string;
  explanation: string;
  exerciseId: ExerciseId;
  /** The learner's own last wrong answer, or null when it can no longer be read. */
  givenAnswer: string | null;
  id: string;
  /** When this skill was last worked, whatever the outcome. */
  lastSeenAt: Timestamp | null;
  mainTopicTitle: string;
  openedAt: Timestamp;
  prompt: string;
  resolvedAt: Timestamp | null;
  skillId: SkillId;
  skillTitle: string;
  status: MistakeEntryStatus;
  subtopicId: TopicId;
  subtopicTitle: string;
  /** How many times this question has been answered wrong. */
  wrongCount: number;
};

export type MistakeNotebook = {
  entries: readonly MistakeEntry[];
  learnedCount: number;
  openCount: number;
};

export function buildMistakeNotebook(
  mistakes: readonly Mistake[],
  attempts: readonly StoredAttempt[],
  index: ContentIndex,
): MistakeNotebook {
  const entries = mistakes.flatMap((mistake) => {
    const exercise = index.bundle.exercises.find(
      (candidate) => candidate.id === mistake.sourceExerciseId,
    );
    const skill = index.bundle.skills.find((candidate) => candidate.id === mistake.skillId);
    if (exercise === undefined || skill === undefined) {
      // The record outlived the content it was filed against. It stays in
      // storage, but nothing here can be shown honestly.
      return [];
    }

    const topic = index.getTopic(skill.topicId);
    const wrongAttempts = attempts.filter(
      (attempt) => attempt.exerciseId === exercise.id && attempt.scored && !attempt.correct,
    );
    const lastWrong = latest(wrongAttempts);
    const storedAnswer = lastWrong === null ? null : parseStoredAnswer(lastWrong.answer);

    return [
      {
        correctAnswer: describeCorrectAnswer(exercise),
        explanation: exercise.explanation,
        exerciseId: exercise.id,
        givenAnswer: storedAnswer === null ? null : describeGivenAnswer(exercise, storedAnswer),
        id: mistake.id,
        lastSeenAt: latest(attemptsForSkill(attempts, mistake.skillId, index))?.occurredAt ?? null,
        mainTopicTitle: index.getUnit(topic.unitId).title,
        openedAt: mistake.createdAt,
        prompt: describePrompt(exercise),
        resolvedAt: mistake.resolvedAt ?? null,
        skillId: mistake.skillId,
        skillTitle: skill.title,
        status: (mistake.status === 'resolved' ? 'learned' : 'open') as MistakeEntryStatus,
        subtopicId: topic.id,
        subtopicTitle: topic.title,
        wrongCount: wrongAttempts.length,
      },
    ];
  });

  // Still open comes first, most-missed first inside that, so the notebook
  // opens on the thing most worth working next.
  const ordered = [...entries].sort(
    (left, right) =>
      Number(left.status === 'learned') - Number(right.status === 'learned') ||
      right.wrongCount - left.wrongCount ||
      right.openedAt.localeCompare(left.openedAt) ||
      left.id.localeCompare(right.id),
  );

  return {
    entries: ordered,
    learnedCount: ordered.filter((entry) => entry.status === 'learned').length,
    openCount: ordered.filter((entry) => entry.status === 'open').length,
  };
}

function attemptsForSkill(
  attempts: readonly StoredAttempt[],
  skillId: SkillId,
  index: ContentIndex,
): readonly StoredAttempt[] {
  const measuring = new Set(
    index.bundle.exercises
      .filter((exercise) => exercise.skillIds.includes(skillId))
      .map((exercise) => exercise.id),
  );

  return attempts.filter((attempt) => measuring.has(attempt.exerciseId));
}

function latest(attempts: readonly StoredAttempt[]): StoredAttempt | null {
  let result: StoredAttempt | null = null;
  for (const attempt of attempts) {
    if (result === null || attempt.occurredAt > result.occurredAt) {
      result = attempt;
    }
  }

  return result;
}
