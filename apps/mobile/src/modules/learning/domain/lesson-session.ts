import type {
  ExerciseDefinition,
  ExerciseId,
  Lesson,
  LessonId,
  PathNodeId,
  SkillId,
  Timestamp,
} from '@/modules/curriculum/domain/content-types';
import type { EvaluationResult, ExerciseAnswer } from '@/modules/learning/domain/answers';
import { evaluateAnswer } from '@/modules/learning/domain/evaluator-registry';
import type { DomainEvent } from '@/modules/learning/domain/events';
import { XP_POLICY_V1, type XpPolicy } from '@/modules/learning/domain/xp-policy';

/**
 * The deterministic lesson engine.
 *
 * Pure TypeScript: no React, no timers, no clock. Every command carries the
 * instant it happened at, so the same inputs always produce the same state and
 * the same events. Nothing here persists — that is Milestone 6.
 */

export type LessonSessionStatus = 'abandoned' | 'active' | 'completed' | 'notStarted';

/** Where the learner stands inside the current exercise. */
export type LessonPhase = 'answering' | 'feedback' | 'finished';

export type Attempt = {
  answer: ExerciseAnswer;
  /** 1-based within its exercise. */
  attemptNumber: number;
  correct: boolean;
  exerciseId: ExerciseId;
  lessonId: LessonId;
  occurredAt: Timestamp;
  scored: boolean;
  skillIds: readonly SkillId[];
};

export type LessonSession = {
  attempts: readonly Attempt[];
  readonly completedAt?: Timestamp;
  currentIndex: number;
  exerciseIds: readonly ExerciseId[];
  /** Result of the answer being shown in the feedback phase. */
  readonly lastEvaluation?: EvaluationResult & { exerciseId: ExerciseId };
  lessonId: LessonId;
  readonly pathNodeId?: PathNodeId;
  phase: LessonPhase;
  readonly startedAt?: Timestamp;
  status: LessonSessionStatus;
  /** XP the engine can award on its own: correctness plus completion. */
  xpEarned: number;
};

export type LessonCommand =
  | { at: Timestamp; type: 'abandonLesson' }
  | { at: Timestamp; type: 'completeLesson' }
  | { at: Timestamp; type: 'continueAfterFeedback' }
  | { at: Timestamp; type: 'startLesson' }
  | { answer: ExerciseAnswer; at: Timestamp; type: 'submitAnswer' };

export type LessonSessionResult = {
  events: readonly DomainEvent[];
  session: LessonSession;
};

export type LessonEngineDeps = {
  exercises: readonly ExerciseDefinition[];
  lesson: Lesson;
  readonly pathNodeId?: PathNodeId;
  readonly xpPolicy?: XpPolicy;
};

export class LessonCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LessonCommandError';
  }
}

export function createLessonSession(deps: LessonEngineDeps): LessonSession {
  if (deps.exercises.length === 0) {
    throw new LessonCommandError(`"${deps.lesson.id}" dersinde alıştırma yok.`);
  }

  return {
    attempts: [],
    currentIndex: 0,
    exerciseIds: deps.exercises.map((exercise) => exercise.id),
    lessonId: deps.lesson.id,
    ...(deps.pathNodeId === undefined ? {} : { pathNodeId: deps.pathNodeId }),
    phase: 'answering',
    status: 'notStarted',
    xpEarned: 0,
  };
}

export function reduceLessonSession(
  session: LessonSession,
  command: LessonCommand,
  deps: LessonEngineDeps,
): LessonSessionResult {
  const policy = deps.xpPolicy ?? XP_POLICY_V1;

  switch (command.type) {
    case 'startLesson':
      return start(session, command.at, deps);
    case 'submitAnswer':
      return submit(session, command.answer, command.at, deps, policy);
    case 'continueAfterFeedback':
      return advance(session, command.at, deps, policy);
    case 'completeLesson':
      return complete(session, command.at, deps, policy);
    case 'abandonLesson':
      return abandon(session, command.at);
  }
}

// ---------------------------------------------------------------------------

function start(
  session: LessonSession,
  at: Timestamp,
  deps: LessonEngineDeps,
): LessonSessionResult {
  if (session.status !== 'notStarted') {
    throw new LessonCommandError('Ders zaten başlatılmış.');
  }

  return {
    events: [{ at, lessonId: deps.lesson.id, type: 'LessonStarted' }],
    session: { ...session, phase: 'answering', startedAt: at, status: 'active' },
  };
}

function submit(
  session: LessonSession,
  answer: ExerciseAnswer,
  at: Timestamp,
  deps: LessonEngineDeps,
  policy: XpPolicy,
): LessonSessionResult {
  requireActive(session);
  if (session.phase !== 'answering') {
    throw new LessonCommandError('Geri bildirim gösterilirken cevap gönderilemez.');
  }

  const exercise = currentExercise(session, deps);
  const evaluation = evaluateAnswer(exercise, answer);
  const attemptNumber =
    session.attempts.filter((attempt) => attempt.exerciseId === exercise.id).length + 1;

  const attempt: Attempt = {
    answer,
    attemptNumber,
    correct: evaluation.correct,
    exerciseId: exercise.id,
    lessonId: deps.lesson.id,
    occurredAt: at,
    scored: evaluation.scored,
    skillIds: exercise.skillIds,
  };

  const awardsXp = evaluation.scored && evaluation.correct;
  const events: DomainEvent[] = [
    { at, attemptNumber, correct: evaluation.correct, exerciseId: exercise.id, type: 'AnswerSubmitted' },
    { at, attemptNumber, exerciseId: exercise.id, type: 'AttemptRecorded' },
  ];

  if (evaluation.scored) {
    events.push(
      evaluation.correct
        ? { at, exerciseId: exercise.id, type: 'AnswerCorrect' }
        : { at, exerciseId: exercise.id, type: 'AnswerIncorrect' },
    );
  }

  events.push({
    at,
    correct: evaluation.correct,
    exerciseId: exercise.id,
    skillIds: exercise.skillIds,
    type: 'SkillEvidenceObserved',
  });

  if (evaluation.scored && !evaluation.correct) {
    events.push({ at, exerciseId: exercise.id, skillIds: exercise.skillIds, type: 'MistakeRecorded' });
  }

  if (awardsXp) {
    events.push({ amount: policy.correctExercise, at, reason: 'correctExercise', type: 'XpEarned' });
  }

  return {
    events,
    session: {
      ...session,
      attempts: [...session.attempts, attempt],
      lastEvaluation: { ...evaluation, exerciseId: exercise.id },
      phase: 'feedback',
      xpEarned: session.xpEarned + (awardsXp ? policy.correctExercise : 0),
    },
  };
}

function advance(
  session: LessonSession,
  at: Timestamp,
  deps: LessonEngineDeps,
  policy: XpPolicy,
): LessonSessionResult {
  requireActive(session);
  if (session.phase !== 'feedback') {
    throw new LessonCommandError('Devam etmek için önce cevap gönderilmeli.');
  }

  const exercise = currentExercise(session, deps);
  const completedEvent: DomainEvent = {
    at,
    exerciseId: exercise.id,
    scored: session.lastEvaluation?.scored ?? false,
    type: 'ExerciseCompleted',
  };

  const isLast = session.currentIndex >= session.exerciseIds.length - 1;
  if (!isLast) {
    const { lastEvaluation: _dropped, ...rest } = session;

    return {
      events: [completedEvent],
      session: { ...rest, currentIndex: session.currentIndex + 1, phase: 'answering' },
    };
  }

  const finished: LessonSession = { ...session, phase: 'finished' };
  const completion = complete(finished, at, deps, policy);

  return { events: [completedEvent, ...completion.events], session: completion.session };
}

function complete(
  session: LessonSession,
  at: Timestamp,
  deps: LessonEngineDeps,
  policy: XpPolicy,
): LessonSessionResult {
  requireActive(session);

  const summary = summarizeAttempts(session);
  const sessionXp = session.xpEarned + policy.lessonCompletion;

  return {
    events: [
      { amount: policy.lessonCompletion, at, reason: 'lessonCompletion', type: 'XpEarned' },
      {
        at,
        correctCount: summary.correctCount,
        firstCompletionBonusXp: policy.firstPathLevelCompletion,
        incorrectCount: summary.incorrectCount,
        lessonId: deps.lesson.id,
        ...(session.pathNodeId === undefined ? {} : { pathNodeId: session.pathNodeId }),
        scoredCount: summary.scoredCount,
        sessionXp,
        type: 'LessonCompleted',
      },
    ],
    session: { ...session, completedAt: at, phase: 'finished', status: 'completed', xpEarned: sessionXp },
  };
}

function abandon(session: LessonSession, at: Timestamp): LessonSessionResult {
  if (session.status !== 'active') {
    throw new LessonCommandError('Yalnızca aktif bir ders bırakılabilir.');
  }

  return {
    events: [{ at, lessonId: session.lessonId, type: 'LessonAbandoned' }],
    session: { ...session, status: 'abandoned' },
  };
}

// ---------------------------------------------------------------------------

function requireActive(session: LessonSession): void {
  if (session.status !== 'active') {
    throw new LessonCommandError(`Ders "${session.status}" durumunda; komut kabul edilmiyor.`);
  }
}

function currentExercise(session: LessonSession, deps: LessonEngineDeps): ExerciseDefinition {
  const exercise = deps.exercises[session.currentIndex];
  if (exercise === undefined) {
    throw new LessonCommandError(`Sıra dışı alıştırma indeksi: ${session.currentIndex}.`);
  }

  return exercise;
}

/**
 * Only the final attempt on each exercise counts toward the summary, so a
 * retry does not inflate the mistake count.
 */
function summarizeAttempts(session: LessonSession): {
  correctCount: number;
  incorrectCount: number;
  scoredCount: number;
} {
  const finalByExercise = new Map<ExerciseId, Attempt>();
  for (const attempt of session.attempts) {
    finalByExercise.set(attempt.exerciseId, attempt);
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let scoredCount = 0;
  for (const attempt of finalByExercise.values()) {
    if (!attempt.scored) {
      continue;
    }
    scoredCount += 1;
    if (attempt.correct) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
    }
  }

  return { correctCount, incorrectCount, scoredCount };
}

export type LessonSummary = {
  accuracyPercent: number;
  correctCount: number;
  exerciseCount: number;
  incorrectCount: number;
  scoredCount: number;
  xpEarned: number;
};

/** View-facing summary of a finished session. */
export function summarizeLessonSession(session: LessonSession): LessonSummary {
  const { correctCount, incorrectCount, scoredCount } = summarizeAttempts(session);

  return {
    accuracyPercent: scoredCount === 0 ? 0 : Math.round((correctCount / scoredCount) * 100),
    correctCount,
    exerciseCount: session.exerciseIds.length,
    incorrectCount,
    scoredCount,
    xpEarned: session.xpEarned,
  };
}
