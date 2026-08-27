import type {
  ExerciseId,
  LessonId,
  PathNodeId,
  SkillId,
  Timestamp,
} from '@/modules/curriculum/domain/content-types';
import type { LocalDate } from '@/shared/time/local-date';

/**
 * Durable learner state.
 *
 * Everything here is the learner's own record of what they did. It is
 * device-local and accountless in v1: there is no identity, no sync, and no
 * personal data — only learning activity. See docs/SECURITY.md.
 */

// ---------------------------------------------------------------------------
// Path progression
// ---------------------------------------------------------------------------

export type PathNodeStatus = 'available' | 'completed' | 'locked' | 'started';

export type PathProgress = {
  completionCount: number;
  readonly firstCompletedAt?: Timestamp;
  readonly firstStartedAt?: Timestamp;
  readonly lastCompletedAt?: Timestamp;
  pathNodeId: PathNodeId;
  status: PathNodeStatus;
};

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

/** Distinguishes a curriculum lesson from an assembled review drill. */
export type SessionKind = 'lesson' | 'review';

export type SessionStatus = 'abandoned' | 'active' | 'completed' | 'stale';

/** Bumped when the serialized session snapshot changes shape. */
export const SESSION_SNAPSHOT_VERSION = 1;

export type StoredSession = {
  readonly completedAt?: Timestamp;
  /** Identifies the content the snapshot was recorded against. */
  contentVersion: string;
  currentExerciseIndex: number;
  kind: SessionKind;
  lessonId: LessonId;
  readonly pathNodeId?: PathNodeId;
  sessionId: string;
  /** JSON snapshot of the domain session, tagged with `snapshotVersion`. */
  snapshot: string;
  snapshotVersion: number;
  startedAt: Timestamp;
  status: SessionStatus;
  updatedAt: Timestamp;
};

export type StoredAttempt = {
  answer: string;
  attemptNumber: number;
  correct: boolean;
  exerciseId: ExerciseId;
  id: string;
  lessonId: LessonId;
  occurredAt: Timestamp;
  scored: boolean;
  sessionId: string;
};

// ---------------------------------------------------------------------------
// XP ledger
// ---------------------------------------------------------------------------

export type XpReason =
  | 'correction'
  | 'exerciseCorrect'
  | 'lessonCompletion'
  | 'pathFirstCompletion';

/**
 * A single auditable XP movement. The total is the sum of the ledger; no
 * running total is authoritative.
 *
 * `uniqueSourceKey` is what makes awards idempotent: a completion bonus carries
 * a key derived from its source, and the store refuses a duplicate. Retrying a
 * failed write can never double-award.
 */
export type XpTransaction = {
  amount: number;
  readonly exerciseId?: ExerciseId;
  id: string;
  readonly lessonId?: LessonId;
  occurredAt: Timestamp;
  readonly pathNodeId?: PathNodeId;
  reason: XpReason;
  readonly sessionId?: string;
  readonly uniqueSourceKey?: string;
};

// ---------------------------------------------------------------------------
// Mastery, review, mistakes
// ---------------------------------------------------------------------------

/** Bumped when the mastery formula changes, so stored state stays explicable. */
export const MASTERY_POLICY_VERSION = 1;

export type SkillMastery = {
  /** Beta-distribution evidence: successes. */
  alpha: number;
  /** Beta-distribution evidence: failures. */
  beta: number;
  evidenceCount: number;
  readonly lastEvidenceAt?: Timestamp;
  policyVersion: number;
  skillId: SkillId;
};

export type ReviewItem = {
  dueAt: Timestamp;
  readonly lastReviewedAt?: Timestamp;
  skillId: SkillId;
  /** Index into the review ladder. */
  stage: number;
  updatedAt: Timestamp;
};

export type MistakeStatus = 'resolved' | 'unresolved';

export type Mistake = {
  createdAt: Timestamp;
  id: string;
  readonly resolvedAt?: Timestamp;
  skillId: SkillId;
  sourceExerciseId: ExerciseId;
  sourceLessonId: LessonId;
  status: MistakeStatus;
};

// ---------------------------------------------------------------------------
// Daily activity (İz)
// ---------------------------------------------------------------------------

export type DailyActivity = {
  firstActivityAt: Timestamp;
  lastActivityAt: Timestamp;
  localDate: LocalDate;
  qualifyingSessions: number;
  /** The zone observed when the day qualified; never rewritten afterwards. */
  timeZone: string;
  xpEarned: number;
};
