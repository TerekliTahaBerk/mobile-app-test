import { CONTENT_SCHEMA_VERSION } from '@/modules/curriculum/domain/content-types';
import type { LessonSession } from '@/modules/learning/domain/lesson-session';
import type {
  ProgressRepositories,
  SessionCompletionInput,
  SessionCompletionResult,
} from '@/modules/progress/application/repositories';
import {
  SESSION_SNAPSHOT_VERSION,
  type SessionKind,
  type StoredAttempt,
  type StoredSession,
} from '@/modules/progress/domain/progress-types';
import type { Clock } from '@/shared/time/clock';
import { toLocalDate } from '@/shared/time/local-date';

/**
 * Translates the in-memory lesson engine into durable records.
 *
 * The engine stays pure and knows nothing about storage; this is the seam where
 * its state becomes rows. Identifiers are derived rather than random so a
 * retried write lands on the same primary keys — the storage layer can then
 * reject the duplicate instead of double-awarding.
 */

/** Identifies the content a snapshot was taken against. */
export const CONTENT_VERSION = String(CONTENT_SCHEMA_VERSION);

export function sessionIdFor(session: LessonSession): string {
  return `${session.lessonId}:${session.startedAt ?? 'unstarted'}`;
}

function attemptId(sessionId: string, exerciseId: string, attemptNumber: number): string {
  return `${sessionId}:${exerciseId}:${attemptNumber}`;
}

export function toStoredSession(
  session: LessonSession,
  kind: SessionKind,
  atIso: string,
): StoredSession {
  const status: StoredSession['status'] =
    session.status === 'completed'
      ? 'completed'
      : session.status === 'abandoned'
        ? 'abandoned'
        : 'active';

  return {
    ...(session.completedAt === undefined ? {} : { completedAt: session.completedAt }),
    contentVersion: CONTENT_VERSION,
    currentExerciseIndex: session.currentIndex,
    kind,
    lessonId: session.lessonId,
    ...(session.pathNodeId === undefined ? {} : { pathNodeId: session.pathNodeId }),
    sessionId: sessionIdFor(session),
    snapshot: JSON.stringify(session),
    snapshotVersion: SESSION_SNAPSHOT_VERSION,
    startedAt: session.startedAt ?? atIso,
    status,
    updatedAt: atIso,
  };
}

/**
 * Rebuilds an engine session from a stored snapshot, or returns `null` when the
 * snapshot was written by a different shape of the app. A resume that cannot be
 * trusted is refused rather than guessed at.
 */
export function restoreSession(stored: StoredSession): LessonSession | null {
  if (stored.snapshotVersion !== SESSION_SNAPSHOT_VERSION) {
    return null;
  }

  if (stored.contentVersion !== CONTENT_VERSION) {
    return null;
  }

  try {
    return JSON.parse(stored.snapshot) as LessonSession;
  } catch {
    return null;
  }
}

export function toStoredAttempts(session: LessonSession): readonly StoredAttempt[] {
  const sessionId = sessionIdFor(session);

  return session.attempts.map((attempt) => ({
    answer: JSON.stringify(attempt.answer),
    attemptNumber: attempt.attemptNumber,
    correct: attempt.correct,
    exerciseId: attempt.exerciseId,
    id: attemptId(sessionId, attempt.exerciseId, attempt.attemptNumber),
    lessonId: attempt.lessonId,
    occurredAt: attempt.occurredAt,
    scored: attempt.scored,
    sessionId,
  }));
}

/**
 * One piece of evidence per scored exercise, taken from its final attempt.
 *
 * A first-attempt correct answer is strong evidence; getting there on a retry
 * is weak. Unscored exercises (flashcards) teach but do not measure, so they
 * produce no evidence at all.
 */
export function toEvidence(session: LessonSession): SessionCompletionInput['evidence'] {
  const finalByExercise = new Map<string, (typeof session.attempts)[number]>();
  for (const attempt of session.attempts) {
    if (attempt.scored) {
      finalByExercise.set(attempt.exerciseId, attempt);
    }
  }

  return [...finalByExercise.values()].map((attempt) => ({
    correct: attempt.correct,
    exerciseId: attempt.exerciseId,
    observedAtIso: attempt.occurredAt,
    skillIds: attempt.skillIds,
    strength: attempt.attemptNumber === 1 && attempt.correct ? 'strong' : 'weak',
  }));
}

export function buildCompletionInput(
  session: LessonSession,
  kind: SessionKind,
  clock: Clock,
): SessionCompletionInput {
  const atMs = clock.now();
  const completedAtIso = session.completedAt ?? new Date(atMs).toISOString();
  const evidence = toEvidence(session);

  return {
    attempts: toStoredAttempts(session),
    completedAtIso,
    correctScoredCount: evidence.filter((item) => item.correct).length,
    evidence,
    lessonId: session.lessonId,
    localDate: toLocalDate(Date.parse(completedAtIso), clock.timeZone()),
    ...(session.pathNodeId === undefined ? {} : { pathNodeId: session.pathNodeId }),
    session: toStoredSession(session, kind, completedAtIso),
    timeZone: clock.timeZone(),
  };
}

export type LessonPersistence = {
  complete: (session: LessonSession, kind: SessionKind) => Promise<SessionCompletionResult>;
  saveProgress: (session: LessonSession, kind: SessionKind) => Promise<void>;
};

export function createLessonPersistence(
  repositories: ProgressRepositories,
  clock: Clock,
): LessonPersistence {
  return {
    complete: (session, kind) =>
      repositories.completion.completeSession(buildCompletionInput(session, kind, clock)),
    saveProgress: async (session, kind) => {
      const atIso = new Date(clock.now()).toISOString();
      const stored = toStoredSession(session, kind, atIso);

      await repositories.sessions.save(stored);

      if (stored.pathNodeId !== undefined && stored.status === 'active') {
        await repositories.progress.markStarted(stored.pathNodeId, stored.startedAt);
      }
    },
  };
}
