import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  ExerciseId,
  LessonId,
  PathNodeId,
  SkillId,
} from '@/modules/curriculum/domain/content-types';
import type {
  AvatarId,
  DailyGoal,
  ExamTarget,
  GradeLevel,
  LearnerProfile,
  ReferralSource,
  ReminderTime,
  StartingPoint,
  StudyTrack,
  WeeklyReportDay,
} from '@/modules/learner/domain/learner-profile';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';
import type {
  AttemptRepository,
  CompletionRepository,
  DailyActivityRepository,
  HeartsRepository,
  LearnerProfileRepository,
  LearnerDataRepository,
  LearnerStatisticsRepository,
  MasteryRepository,
  MistakeRepository,
  ProgressRepositories,
  ProgressRepository,
  QuestionReportRepository,
  ReviewRepository,
  SessionCompletionInput,
  SessionCompletionResult,
  SessionProgressRepository,
  SessionRepository,
  XpRepository,
} from '@/modules/progress/application/repositories';
import { applyMasteryEvidence } from '@/modules/progress/domain/mastery-policy';
import type {
  DailyActivity,
  Mistake,
  PathNodeStatus,
  PathProgress,
  QuestionReport,
  ReviewItem,
  SkillMastery,
  StoredAttempt,
  StoredSession,
  XpTransaction,
} from '@/modules/progress/domain/progress-types';
import { applyReviewEvidence } from '@/modules/progress/domain/review-policy';
import type { LocalDate } from '@/shared/time/local-date';

/**
 * SQLite adapters for the progress repositories.
 *
 * Every statement binds its parameters — no SQL is assembled from values. The
 * only interpolation anywhere in this module's schema layer is the migration
 * `PRAGMA user_version`, which takes a literal defined in code.
 */

// A transaction handle exposes the same query surface as the database.
type Queryable = Pick<
  SQLiteDatabase,
  'getAllAsync' | 'getFirstAsync' | 'runAsync'
>;

// ---------------------------------------------------------------------------
// Row shapes and mapping
// ---------------------------------------------------------------------------

type PathProgressRow = {
  completion_count: number;
  first_completed_at: string | null;
  first_started_at: string | null;
  last_completed_at: string | null;
  path_node_id: string;
  status: string;
};

function toPathProgress(row: PathProgressRow): PathProgress {
  return {
    completionCount: row.completion_count,
    ...(row.first_completed_at === null ? {} : { firstCompletedAt: row.first_completed_at }),
    ...(row.first_started_at === null ? {} : { firstStartedAt: row.first_started_at }),
    ...(row.last_completed_at === null ? {} : { lastCompletedAt: row.last_completed_at }),
    pathNodeId: row.path_node_id as PathNodeId,
    status: row.status as PathNodeStatus,
  };
}

type SessionRow = {
  completed_at: string | null;
  content_version: string;
  current_exercise_index: number;
  context: string;
  kind: string;
  lesson_id: string;
  path_node_id: string | null;
  purpose: string;
  session_id: string;
  snapshot: string;
  snapshot_version: number;
  started_at: string;
  status: string;
  updated_at: string;
};

function toSession(row: SessionRow): StoredSession {
  return {
    ...(row.completed_at === null ? {} : { completedAt: row.completed_at }),
    contentVersion: row.content_version,
    context: JSON.parse(row.context) as StoredSession['context'],
    currentExerciseIndex: row.current_exercise_index,
    kind: row.kind as StoredSession['kind'],
    lessonId: row.lesson_id as LessonId,
    ...(row.path_node_id === null ? {} : { pathNodeId: row.path_node_id as PathNodeId }),
    purpose: row.purpose as StoredSession['purpose'],
    sessionId: row.session_id,
    snapshot: row.snapshot,
    snapshotVersion: row.snapshot_version,
    startedAt: row.started_at,
    status: row.status as StoredSession['status'],
    updatedAt: row.updated_at,
  };
}

type AttemptRow = {
  answer: string;
  attempt_number: number;
  correct: number;
  exercise_id: string;
  id: string;
  lesson_id: string;
  occurred_at: string;
  scored: number;
  session_id: string;
};

function toAttempt(row: AttemptRow): StoredAttempt {
  return {
    answer: row.answer,
    attemptNumber: row.attempt_number,
    correct: row.correct === 1,
    exerciseId: row.exercise_id as ExerciseId,
    id: row.id,
    lessonId: row.lesson_id as LessonId,
    occurredAt: row.occurred_at,
    scored: row.scored === 1,
    sessionId: row.session_id,
  };
}

type XpRow = {
  amount: number;
  exercise_id: string | null;
  id: string;
  lesson_id: string | null;
  occurred_at: string;
  path_node_id: string | null;
  reason: string;
  session_id: string | null;
  unique_source_key: string | null;
};

function toXpTransaction(row: XpRow): XpTransaction {
  return {
    amount: row.amount,
    ...(row.exercise_id === null ? {} : { exerciseId: row.exercise_id as ExerciseId }),
    id: row.id,
    ...(row.lesson_id === null ? {} : { lessonId: row.lesson_id as LessonId }),
    occurredAt: row.occurred_at,
    ...(row.path_node_id === null ? {} : { pathNodeId: row.path_node_id as PathNodeId }),
    reason: row.reason as XpTransaction['reason'],
    ...(row.session_id === null ? {} : { sessionId: row.session_id }),
    ...(row.unique_source_key === null ? {} : { uniqueSourceKey: row.unique_source_key }),
  };
}

type MasteryRow = {
  alpha: number;
  beta: number;
  evidence_count: number;
  last_evidence_at: string | null;
  policy_version: number;
  skill_id: string;
};

function toMastery(row: MasteryRow): SkillMastery {
  return {
    alpha: row.alpha,
    beta: row.beta,
    evidenceCount: row.evidence_count,
    ...(row.last_evidence_at === null ? {} : { lastEvidenceAt: row.last_evidence_at }),
    policyVersion: row.policy_version,
    skillId: row.skill_id as SkillId,
  };
}

type ReviewRow = {
  due_at: string;
  last_reviewed_at: string | null;
  skill_id: string;
  stage: number;
  updated_at: string;
};

function toReviewItem(row: ReviewRow): ReviewItem {
  return {
    dueAt: row.due_at,
    ...(row.last_reviewed_at === null ? {} : { lastReviewedAt: row.last_reviewed_at }),
    skillId: row.skill_id as SkillId,
    stage: row.stage,
    updatedAt: row.updated_at,
  };
}

type MistakeRow = {
  created_at: string;
  id: string;
  resolved_at: string | null;
  skill_id: string;
  source_exercise_id: string;
  source_lesson_id: string;
  status: string;
};

function toMistake(row: MistakeRow): Mistake {
  return {
    createdAt: row.created_at,
    id: row.id,
    ...(row.resolved_at === null ? {} : { resolvedAt: row.resolved_at }),
    skillId: row.skill_id as SkillId,
    sourceExerciseId: row.source_exercise_id as ExerciseId,
    sourceLessonId: row.source_lesson_id as LessonId,
    status: row.status as Mistake['status'],
  };
}

type DailyActivityRow = {
  first_activity_at: string;
  last_activity_at: string;
  local_date: string;
  qualifying_sessions: number;
  time_zone: string;
  xp_earned: number;
};

function toDailyActivity(row: DailyActivityRow): DailyActivity {
  return {
    firstActivityAt: row.first_activity_at,
    lastActivityAt: row.last_activity_at,
    localDate: row.local_date,
    qualifyingSessions: row.qualifying_sessions,
    timeZone: row.time_zone,
    xpEarned: row.xp_earned,
  };
}

// ---------------------------------------------------------------------------
// Shared write helpers
// ---------------------------------------------------------------------------

async function upsertSession(txn: Queryable, session: StoredSession): Promise<void> {
  await txn.runAsync(
    `INSERT INTO sessions (
       session_id, kind, purpose, context, lesson_id, path_node_id, content_version, status,
       current_exercise_index, snapshot, snapshot_version, started_at, updated_at, completed_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (session_id) DO UPDATE SET
       status = excluded.status,
       purpose = excluded.purpose,
       context = excluded.context,
       current_exercise_index = excluded.current_exercise_index,
       snapshot = excluded.snapshot,
       snapshot_version = excluded.snapshot_version,
       updated_at = excluded.updated_at,
       completed_at = COALESCE(excluded.completed_at, sessions.completed_at)`,
    [
      session.sessionId,
      session.kind,
      session.purpose,
      JSON.stringify(session.context),
      session.lessonId,
      session.pathNodeId ?? null,
      session.contentVersion,
      session.status,
      session.currentExerciseIndex,
      session.snapshot,
      session.snapshotVersion,
      session.startedAt,
      session.updatedAt,
      session.completedAt ?? null,
    ],
  );
}

async function insertAttempt(txn: Queryable, attempt: StoredAttempt): Promise<void> {
  await txn.runAsync(
    `INSERT OR IGNORE INTO attempts (
       id, session_id, lesson_id, exercise_id, answer, correct, scored, attempt_number, occurred_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      attempt.id,
      attempt.sessionId,
      attempt.lessonId,
      attempt.exerciseId,
      attempt.answer,
      attempt.correct ? 1 : 0,
      attempt.scored ? 1 : 0,
      attempt.attemptNumber,
      attempt.occurredAt,
    ],
  );
}

/**
 * Writes one XP movement, returning the amount actually credited.
 *
 * `INSERT OR IGNORE` against the unique source key is what makes awards
 * idempotent at the storage layer: a retried completion collides and credits
 * zero. Nothing depends on the UI having disabled a button.
 */
async function insertXp(txn: Queryable, entry: XpTransaction): Promise<number> {
  const result = await txn.runAsync(
    `INSERT OR IGNORE INTO xp_transactions (
       id, amount, reason, lesson_id, exercise_id, path_node_id, session_id, occurred_at, unique_source_key
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.amount,
      entry.reason,
      entry.lessonId ?? null,
      entry.exerciseId ?? null,
      entry.pathNodeId ?? null,
      entry.sessionId ?? null,
      entry.occurredAt,
      entry.uniqueSourceKey ?? null,
    ],
  );

  return result.changes > 0 ? entry.amount : 0;
}

async function upsertMastery(txn: Queryable, mastery: SkillMastery): Promise<void> {
  await txn.runAsync(
    `INSERT INTO skill_mastery (skill_id, alpha, beta, evidence_count, last_evidence_at, policy_version)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (skill_id) DO UPDATE SET
       alpha = excluded.alpha,
       beta = excluded.beta,
       evidence_count = excluded.evidence_count,
       last_evidence_at = excluded.last_evidence_at,
       policy_version = excluded.policy_version`,
    [
      mastery.skillId,
      mastery.alpha,
      mastery.beta,
      mastery.evidenceCount,
      mastery.lastEvidenceAt ?? null,
      mastery.policyVersion,
    ],
  );
}

async function upsertReviewItem(txn: Queryable, item: ReviewItem): Promise<void> {
  await txn.runAsync(
    `INSERT INTO review_items (skill_id, stage, due_at, last_reviewed_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (skill_id) DO UPDATE SET
       stage = excluded.stage,
       due_at = excluded.due_at,
       last_reviewed_at = excluded.last_reviewed_at,
       updated_at = excluded.updated_at`,
    [item.skillId, item.stage, item.dueAt, item.lastReviewedAt ?? null, item.updatedAt],
  );
}

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

const XP_SOURCE = {
  exercise: (sessionId: string, exerciseId: string) => `exercise:${sessionId}:${exerciseId}`,
  lesson: (sessionId: string) => `lesson:${sessionId}`,
  // Not session-scoped: the first-completion bonus is paid once per path node,
  // for the whole lifetime of the install.
  pathFirst: (pathNodeId: string) => `path-first:${pathNodeId}`,
};

async function completeSessionAtomically(
  txn: Queryable,
  input: SessionCompletionInput,
): Promise<SessionCompletionResult> {
  const existing = await txn.getFirstAsync<{ status: string }>(
    'SELECT status FROM sessions WHERE session_id = ?',
    [input.session.sessionId],
  );

  if (existing?.status === 'completed') {
    return {
      alreadyCompleted: true,
      awardedXp: 0,
      firstCompletionAwarded: false,
    };
  }

  await upsertSession(txn, {
    ...input.session,
    completedAt: input.completedAtIso,
    status: 'completed',
    updatedAt: input.completedAtIso,
  });

  for (const attempt of input.attempts) {
    await insertAttempt(txn, attempt);
  }

  let awardedXp = 0;

  for (const evidence of input.evidence) {
    if (!evidence.correct) {
      continue;
    }

    awardedXp += await insertXp(txn, {
      amount: XP_POLICY_V1.correctExercise,
      exerciseId: evidence.exerciseId as ExerciseId,
      id: XP_SOURCE.exercise(input.session.sessionId, evidence.exerciseId),
      lessonId: input.lessonId,
      occurredAt: input.completedAtIso,
      reason: 'exerciseCorrect',
      sessionId: input.session.sessionId,
      uniqueSourceKey: XP_SOURCE.exercise(input.session.sessionId, evidence.exerciseId),
    });
  }

  // A review drill earns per-exercise XP only: no completion bonus, and never a
  // first-completion bonus, so revisiting old material cannot farm XP.
  if (input.session.kind === 'lesson') {
    awardedXp += await insertXp(txn, {
      amount: XP_POLICY_V1.lessonCompletion,
      id: XP_SOURCE.lesson(input.session.sessionId),
      lessonId: input.lessonId,
      occurredAt: input.completedAtIso,
      reason: 'lessonCompletion',
      sessionId: input.session.sessionId,
      uniqueSourceKey: XP_SOURCE.lesson(input.session.sessionId),
    });
  }

  let firstCompletionAwarded = false;
  const pathNodeId = input.pathNodeId;

  if (pathNodeId !== undefined && input.session.kind === 'lesson') {
    const bonus = await insertXp(txn, {
      amount: XP_POLICY_V1.firstPathLevelCompletion,
      id: XP_SOURCE.pathFirst(pathNodeId),
      lessonId: input.lessonId,
      occurredAt: input.completedAtIso,
      pathNodeId,
      reason: 'pathFirstCompletion',
      sessionId: input.session.sessionId,
      uniqueSourceKey: XP_SOURCE.pathFirst(pathNodeId),
    });

    firstCompletionAwarded = bonus > 0;
    awardedXp += bonus;

    await txn.runAsync(
      `INSERT INTO path_progress (
         path_node_id, status, first_started_at, first_completed_at, last_completed_at, completion_count
       ) VALUES (?, 'completed', ?, ?, ?, 1)
       ON CONFLICT (path_node_id) DO UPDATE SET
         status = 'completed',
         first_completed_at = COALESCE(path_progress.first_completed_at, excluded.first_completed_at),
         last_completed_at = excluded.last_completed_at,
         completion_count = path_progress.completion_count + 1`,
      [pathNodeId, input.session.startedAt, input.completedAtIso, input.completedAtIso],
    );
  }

  for (const evidence of input.evidence) {
    for (const skillId of evidence.skillIds) {
      const masteryRow = await txn.getFirstAsync<MasteryRow>(
        'SELECT * FROM skill_mastery WHERE skill_id = ?',
        [skillId],
      );
      await upsertMastery(
        txn,
        applyMasteryEvidence(masteryRow === null ? null : toMastery(masteryRow), {
          correct: evidence.correct,
          observedAt: evidence.observedAtIso,
          skillId,
          strength: evidence.strength,
        }),
      );

      const reviewRow = await txn.getFirstAsync<ReviewRow>(
        'SELECT * FROM review_items WHERE skill_id = ?',
        [skillId],
      );
      await upsertReviewItem(
        txn,
        applyReviewEvidence(reviewRow === null ? null : toReviewItem(reviewRow), {
          correct: evidence.correct,
          observedAt: Date.parse(evidence.observedAtIso),
          skillId,
          strength: evidence.strength,
        }),
      );

      if (evidence.correct) {
        // Only a clean answer clears the mistake; scraping through on a retry
        // leaves it open so the learner sees it again.
        if (input.session.kind === 'review' && evidence.strength === 'strong') {
          await txn.runAsync(
            `UPDATE mistakes SET status = 'resolved', resolved_at = ?
             WHERE skill_id = ? AND status = 'unresolved'`,
            [evidence.observedAtIso, skillId],
          );
        }
        continue;
      }

      await txn.runAsync(
        `INSERT OR IGNORE INTO mistakes (
           id, skill_id, source_exercise_id, source_lesson_id, status, created_at, resolved_at
         ) VALUES (?, ?, ?, ?, 'unresolved', ?, NULL)`,
        [
          // Session-scoped id keeps a retry idempotent, while the partial unique
          // index keeps at most one *open* mistake per skill. A mistake resolved
          // earlier can therefore be opened again later.
          `mistake:${input.session.sessionId}:${skillId}`,
          skillId,
          evidence.exerciseId,
          input.lessonId,
          evidence.observedAtIso,
        ],
      );
    }
  }

  await txn.runAsync(
    `INSERT INTO daily_activity (
       local_date, time_zone, qualifying_sessions, xp_earned, first_activity_at, last_activity_at
     ) VALUES (?, ?, 1, ?, ?, ?)
     ON CONFLICT (local_date) DO UPDATE SET
       qualifying_sessions = daily_activity.qualifying_sessions + 1,
       xp_earned = daily_activity.xp_earned + excluded.xp_earned,
       last_activity_at = excluded.last_activity_at`,
    [input.localDate, input.timeZone, awardedXp, input.completedAtIso, input.completedAtIso],
  );

  return { alreadyCompleted: false, awardedXp, firstCompletionAwarded };
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export function createSqliteRepositories(db: SQLiteDatabase): ProgressRepositories {
  const progress: ProgressRepository = {
    getAll: async () => {
      const rows = await db.getAllAsync<PathProgressRow>(
        'SELECT * FROM path_progress ORDER BY path_node_id',
      );

      return rows.map(toPathProgress);
    },
    get: async (pathNodeId) => {
      const row = await db.getFirstAsync<PathProgressRow>(
        'SELECT * FROM path_progress WHERE path_node_id = ?',
        [pathNodeId],
      );

      return row === null ? null : toPathProgress(row);
    },
    markStarted: async (pathNodeId, atIso) => {
      await db.runAsync(
        `INSERT INTO path_progress (path_node_id, status, first_started_at, completion_count)
         VALUES (?, 'started', ?, 0)
         ON CONFLICT (path_node_id) DO UPDATE SET
           first_started_at = COALESCE(path_progress.first_started_at, excluded.first_started_at),
           status = CASE WHEN path_progress.status = 'completed' THEN 'completed' ELSE 'started' END`,
        [pathNodeId, atIso],
      );
    },
  };

  const sessions: SessionRepository = {
    completionCounts: async () => {
      const rows = await db.getAllAsync<{ count: number; kind: string }>(
        `SELECT kind, COUNT(*) AS count FROM sessions
         WHERE status = 'completed' GROUP BY kind`,
      );

      return {
        lessons: rows.find((row) => row.kind === 'lesson')?.count ?? 0,
        reviews: rows.find((row) => row.kind === 'review')?.count ?? 0,
      };
    },
    findActive: async () => {
      const row = await db.getFirstAsync<SessionRow>(
        `SELECT * FROM sessions WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1`,
      );

      return row === null ? null : toSession(row);
    },
    get: async (sessionId) => {
      const row = await db.getFirstAsync<SessionRow>(
        'SELECT * FROM sessions WHERE session_id = ?',
        [sessionId],
      );

      return row === null ? null : toSession(row);
    },
    markStale: async (sessionId, atIso) => {
      await db.runAsync(
        `UPDATE sessions SET status = 'stale', updated_at = ? WHERE session_id = ? AND status = 'active'`,
        [atIso, sessionId],
      );
    },
    save: async (session) => {
      await upsertSession(db, session);
    },
  };

  const attempts: AttemptRepository = {
    listAllScored: async () => {
      const rows = await db.getAllAsync<AttemptRow>(
        'SELECT * FROM attempts WHERE scored = 1 ORDER BY occurred_at, id',
      );

      return rows.map(toAttempt);
    },
    listForSession: async (sessionId) => {
      const rows = await db.getAllAsync<AttemptRow>(
        'SELECT * FROM attempts WHERE session_id = ? ORDER BY occurred_at, attempt_number',
        [sessionId],
      );

      return rows.map(toAttempt);
    },
  };

  const sessionProgress: SessionProgressRepository = {
    save: async (session, observedAttempts) => {
      await db.withExclusiveTransactionAsync(async (txn) => {
        await upsertSession(txn, session);
        for (const attempt of observedAttempts) {
          await insertAttempt(txn, attempt);
        }
        if (session.pathNodeId !== undefined && session.status === 'active') {
          await txn.runAsync(
            `INSERT INTO path_progress (path_node_id, status, first_started_at, completion_count)
             VALUES (?, 'started', ?, 0)
             ON CONFLICT (path_node_id) DO UPDATE SET
               first_started_at = COALESCE(path_progress.first_started_at, excluded.first_started_at),
               status = CASE WHEN path_progress.status = 'completed' THEN 'completed' ELSE 'started' END`,
            [session.pathNodeId, session.startedAt],
          );
        }
      });
    },
  };

  const statistics: LearnerStatisticsRepository = {
    read: async () => {
      const correct = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM attempts WHERE scored = 1 AND correct = 1`,
      );
      const perfect = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count
         FROM sessions AS session
         WHERE session.status = 'completed'
           AND EXISTS (
             SELECT 1 FROM attempts AS attempt
             WHERE attempt.session_id = session.session_id AND attempt.scored = 1
           )
           AND NOT EXISTS (
             SELECT 1 FROM attempts AS attempt
             WHERE attempt.session_id = session.session_id
               AND attempt.scored = 1
               AND attempt.correct = 0
           )`,
      );

      return {
        correctAnswers: correct?.count ?? 0,
        perfectRounds: perfect?.count ?? 0,
      };
    },
  };

  const xp: XpRepository = {
    total: async () => {
      const row = await db.getFirstAsync<{ total: number | null }>(
        'SELECT SUM(amount) AS total FROM xp_transactions',
      );

      return row?.total ?? 0;
    },
    list: async () => {
      const rows = await db.getAllAsync<XpRow>(
        'SELECT * FROM xp_transactions ORDER BY occurred_at DESC, id',
      );

      return rows.map(toXpTransaction);
    },
  };

  const mastery: MasteryRepository = {
    get: async (skillId) => {
      const row = await db.getFirstAsync<MasteryRow>(
        'SELECT * FROM skill_mastery WHERE skill_id = ?',
        [skillId],
      );

      return row === null ? null : toMastery(row);
    },
    getMany: async (skillIds) => {
      if (skillIds.length === 0) {
        return [];
      }

      // Placeholders are generated from the argument *count*, never from the
      // values themselves; every value is still bound.
      const placeholders = skillIds.map(() => '?').join(', ');
      const rows = await db.getAllAsync<MasteryRow>(
        `SELECT * FROM skill_mastery WHERE skill_id IN (${placeholders}) ORDER BY skill_id`,
        [...skillIds],
      );

      return rows.map(toMastery);
    },
  };

  const review: ReviewRepository = {
    get: async (skillId) => {
      const row = await db.getFirstAsync<ReviewRow>(
        'SELECT * FROM review_items WHERE skill_id = ?',
        [skillId],
      );

      return row === null ? null : toReviewItem(row);
    },
    listAll: async () => {
      const rows = await db.getAllAsync<ReviewRow>(
        'SELECT * FROM review_items ORDER BY due_at, skill_id',
      );

      return rows.map(toReviewItem);
    },
    listDue: async (atIso) => {
      const rows = await db.getAllAsync<ReviewRow>(
        'SELECT * FROM review_items WHERE due_at <= ? ORDER BY due_at, skill_id',
        [atIso],
      );

      return rows.map(toReviewItem);
    },
  };

  const mistakes: MistakeRepository = {
    listAll: async () => {
      const rows = await db.getAllAsync<MistakeRow>(
        'SELECT * FROM mistakes ORDER BY created_at, id',
      );

      return rows.map(toMistake);
    },
    listUnresolved: async () => {
      const rows = await db.getAllAsync<MistakeRow>(
        `SELECT * FROM mistakes WHERE status = 'unresolved' ORDER BY created_at, id`,
      );

      return rows.map(toMistake);
    },
    resolveForSkill: async (skillId, atIso) => {
      await db.runAsync(
        `UPDATE mistakes SET status = 'resolved', resolved_at = ?
         WHERE skill_id = ? AND status = 'unresolved'`,
        [atIso, skillId],
      );
    },
  };

  const reports: QuestionReportRepository = {
    listAll: async () => {
      const rows = await db.getAllAsync<QuestionReportRow>(
        'SELECT * FROM question_reports ORDER BY created_at, id',
      );

      return rows.map((row) => ({
        createdAt: row.created_at,
        exerciseId: row.exercise_id,
        id: row.id,
        reason: row.reason as QuestionReport['reason'],
        sessionId: row.session_id,
      }));
    },
    record: async (report) => {
      await db.runAsync(
        `INSERT INTO question_reports (id, exercise_id, session_id, reason, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           reason     = excluded.reason,
           created_at = excluded.created_at`,
        [report.id, report.exerciseId, report.sessionId, report.reason, report.createdAt],
      );
    },
  };

  const dailyActivity: DailyActivityRepository = {
    list: async () => {
      const rows = await db.getAllAsync<DailyActivityRow>(
        'SELECT * FROM daily_activity ORDER BY local_date',
      );

      return rows.map(toDailyActivity);
    },
    listQualifyingDates: async () => {
      const rows = await db.getAllAsync<{ local_date: string }>(
        'SELECT local_date FROM daily_activity WHERE qualifying_sessions > 0 ORDER BY local_date',
      );

      return rows.map((row) => row.local_date as LocalDate);
    },
    get: async (localDate) => {
      const row = await db.getFirstAsync<DailyActivityRow>(
        'SELECT * FROM daily_activity WHERE local_date = ?',
        [localDate],
      );

      return row === null ? null : toDailyActivity(row);
    },
  };

  const hearts: HeartsRepository = {
    read: async () => {
      const row = await db.getFirstAsync<HeartsRow>('SELECT * FROM hearts WHERE id = 1');

      return row === null ? null : { hearts: row.hearts, updatedAtMs: row.updated_at_ms };
    },
    write: async (record) => {
      await db.runAsync(
        `INSERT INTO hearts (id, hearts, updated_at_ms) VALUES (1, ?, ?)
         ON CONFLICT (id) DO UPDATE SET hearts = excluded.hearts,
                                        updated_at_ms = excluded.updated_at_ms`,
        [record.hearts, record.updatedAtMs],
      );
    },
  };

  const profile: LearnerProfileRepository = {
    read: async () => {
      const row = await db.getFirstAsync<LearnerProfileRow>(
        'SELECT * FROM learner_profile WHERE id = 1',
      );

      return row === null ? null : toLearnerProfile(row);
    },
    write: async (value) => {
      await db.runAsync(
        `INSERT INTO learner_profile (
           id, display_name, avatar_id, exam, track, grade, target_year,
           referral_source, daily_goal, starting_point, reminders_enabled,
           reminder_time, weekly_report_day, completed_at
         ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           display_name      = excluded.display_name,
           avatar_id         = excluded.avatar_id,
           exam              = excluded.exam,
           track             = excluded.track,
           grade             = excluded.grade,
           target_year       = excluded.target_year,
           referral_source   = excluded.referral_source,
           daily_goal        = excluded.daily_goal,
           starting_point    = excluded.starting_point,
           reminders_enabled = excluded.reminders_enabled,
           reminder_time     = excluded.reminder_time,
           weekly_report_day = excluded.weekly_report_day,
           completed_at      = excluded.completed_at`,
        [
          value.displayName,
          value.avatarId,
          value.exam,
          value.track ?? null,
          value.grade,
          value.targetYear,
          value.referralSource ?? null,
          value.dailyGoal,
          value.startingPoint,
          value.remindersEnabled ? 1 : 0,
          value.reminderTime ?? null,
          value.weeklyReportDay,
          value.completedAtIso,
        ],
      );
    },
  };

  const learnerData: LearnerDataRepository = {
    reset: async () => {
      // Keep this list explicit. Adding a learner-owned table must be an
      // intentional reset-policy decision, not an accidental omission.
      await db.withExclusiveTransactionAsync(async (txn) => {
        await txn.execAsync(`
          DELETE FROM attempts;
          DELETE FROM sessions;
          DELETE FROM xp_transactions;
          DELETE FROM path_progress;
          DELETE FROM skill_mastery;
          DELETE FROM review_items;
          DELETE FROM mistakes;
          DELETE FROM daily_activity;
          DELETE FROM hearts;
          DELETE FROM question_reports;
          DELETE FROM learner_profile;
        `);
      });
    },
  };

  const completion: CompletionRepository = {
    completeSession: async (input) => {
      let result: SessionCompletionResult = {
        alreadyCompleted: false,
        awardedXp: 0,
        firstCompletionAwarded: false,
      };

      // One exclusive transaction: the completion lands whole or not at all.
      await db.withExclusiveTransactionAsync(async (txn) => {
        result = await completeSessionAtomically(txn, input);
      });

      return result;
    },
  };

  return {
    attempts,
    completion,
    dailyActivity,
    hearts,
    learnerData,
    mastery,
    mistakes,
    profile,
    reports,
    progress,
    review,
    sessionProgress,
    sessions,
    statistics,
    xp,
  };
}

type QuestionReportRow = {
  created_at: string;
  exercise_id: string;
  id: string;
  reason: string;
  session_id: string;
};

type HeartsRow = {
  hearts: number;
  id: number;
  updated_at_ms: number;
};

type LearnerProfileRow = {
  avatar_id: string;
  completed_at: string;
  daily_goal: number;
  display_name: string;
  exam: string;
  grade: string;
  id: number;
  referral_source: string | null;
  reminder_time: string | null;
  reminders_enabled: number;
  starting_point: string;
  target_year: number;
  track: string | null;
  weekly_report_day: number;
};

function toLearnerProfile(row: LearnerProfileRow): LearnerProfile {
  return {
    avatarId: row.avatar_id as AvatarId,
    completedAtIso: row.completed_at,
    dailyGoal: row.daily_goal as DailyGoal,
    displayName: row.display_name,
    exam: row.exam as ExamTarget,
    grade: row.grade as GradeLevel,
    ...(row.referral_source === null
      ? {}
      : { referralSource: row.referral_source as ReferralSource }),
    ...(row.reminder_time === null
      ? {}
      : { reminderTime: row.reminder_time as ReminderTime }),
    remindersEnabled: row.reminders_enabled === 1,
    startingPoint: row.starting_point as StartingPoint,
    targetYear: row.target_year,
    weeklyReportDay: row.weekly_report_day as WeeklyReportDay,
    ...(row.track === null ? {} : { track: row.track as StudyTrack }),
  };
}
