import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type { LessonSession } from '@/modules/learning/domain/lesson-session';
import type {
  ProgressRepositories,
  SessionCompletionInput,
  SessionCompletionResult,
} from '@/modules/progress/application/repositories';
import {
  SESSION_SNAPSHOT_VERSION,
  type SessionKind,
  type SessionContext,
  type SessionPurpose,
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
export const CONTENT_VERSION = getContentIndex().bundle.contentVersion;

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
  purpose: SessionPurpose = kind,
  context: SessionContext = {},
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
    context,
    currentExerciseIndex: session.currentIndex,
    kind,
    lessonId: session.lessonId,
    ...(session.pathNodeId === undefined ? {} : { pathNodeId: session.pathNodeId }),
    purpose,
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
    const candidate: unknown = JSON.parse(stored.snapshot);
    if (!isLessonSessionSnapshot(candidate, stored)) {
      return null;
    }

    const index = getContentIndex();
    index.getLesson(candidate.lessonId);
    for (const exerciseId of candidate.exerciseIds) {
      index.getExercise(exerciseId);
    }

    return candidate;
  } catch {
    return null;
  }
}

function isLessonSessionSnapshot(
  value: unknown,
  stored: StoredSession,
): value is LessonSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const session = value as Partial<LessonSession>;
  const validStatus = ['notStarted', 'active', 'completed', 'abandoned'].includes(
    String(session.status),
  );
  const validPhase = ['answering', 'feedback', 'finished'].includes(String(session.phase));

  return (
    session.lessonId === stored.lessonId &&
    Array.isArray(session.exerciseIds) &&
    session.exerciseIds.length > 0 &&
    session.exerciseIds.every((id) => typeof id === 'string') &&
    Array.isArray(session.attempts) &&
    typeof session.currentIndex === 'number' &&
    session.currentIndex >= 0 &&
    session.currentIndex < session.exerciseIds.length &&
    typeof session.xpEarned === 'number' &&
    validStatus &&
    validPhase
  );
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
 * One piece of evidence per scored attempt. A miss remains negative evidence
 * even when a later retry succeeds; collapsing to the final answer would hide
 * exactly the weakness mastery and mistake remediation need to remember.
 * Unscored flashcards produce no evidence.
 */
export function toEvidence(session: LessonSession): SessionCompletionInput['evidence'] {
  return session.attempts
    .filter((attempt) => attempt.scored)
    .map((attempt) => ({
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
  purpose: SessionPurpose = kind,
  context: SessionContext = {},
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
    session: toStoredSession(session, kind, completedAtIso, purpose, context),
    timeZone: clock.timeZone(),
  };
}

export type LessonPersistence = {
  complete: (
    session: LessonSession,
    kind: SessionKind,
    purpose: SessionPurpose,
    context: SessionContext,
  ) => Promise<SessionCompletionResult>;
  saveProgress: (
    session: LessonSession,
    kind: SessionKind,
    purpose: SessionPurpose,
    context: SessionContext,
  ) => Promise<void>;
};

export function createLessonPersistence(
  repositories: ProgressRepositories,
  clock: Clock,
): LessonPersistence {
  return {
    complete: (session, kind, purpose, context) =>
      repositories.completion.completeSession(
        buildCompletionInput(session, kind, clock, purpose, context),
      ),
    saveProgress: async (session, kind, purpose, context) => {
      const atIso = new Date(clock.now()).toISOString();
      const stored = toStoredSession(session, kind, atIso, purpose, context);
      await repositories.sessionProgress.save(stored, toStoredAttempts(session));
    },
  };
}
