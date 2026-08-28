import type {
  LessonId,
  PathNodeId,
  SkillId,
} from '@/modules/curriculum/domain/content-types';
import type { LearnerProfile } from '@/modules/learner/domain/learner-profile';
import type { HeartsRecord } from '@/modules/progress/domain/hearts-policy';
import type {
  DailyActivity,
  Mistake,
  PathProgress,
  ReviewItem,
  SkillMastery,
  StoredAttempt,
  StoredSession,
  XpTransaction,
} from '@/modules/progress/domain/progress-types';
import type { LocalDate } from '@/shared/time/local-date';

/**
 * Repository contracts, defined by the application and implemented by
 * infrastructure. Dependencies point inward: nothing here knows that SQLite
 * exists, which is what keeps a later cloud-sync adapter possible without
 * reshaping the domain.
 */

export type ProgressRepository = {
  getAll: () => Promise<readonly PathProgress[]>;
  get: (pathNodeId: PathNodeId) => Promise<PathProgress | null>;
  markStarted: (pathNodeId: PathNodeId, atIso: string) => Promise<void>;
};

export type SessionRepository = {
  completionCounts: () => Promise<{ lessons: number; reviews: number }>;
  findActive: () => Promise<StoredSession | null>;
  get: (sessionId: string) => Promise<StoredSession | null>;
  markStale: (sessionId: string, atIso: string) => Promise<void>;
  save: (session: StoredSession) => Promise<void>;
};

export type AttemptRepository = {
  listAllScored: () => Promise<readonly StoredAttempt[]>;
  listForSession: (sessionId: string) => Promise<readonly StoredAttempt[]>;
};

/** Atomically snapshots an active session and every attempt observed so far. */
export type SessionProgressRepository = {
  save: (session: StoredSession, attempts: readonly StoredAttempt[]) => Promise<void>;
};

export type LearnerStatisticsRepository = {
  /** Derived from durable scored attempts and completed sessions. */
  read: () => Promise<{ correctAnswers: number; perfectRounds: number }>;
};

export type XpRepository = {
  /** The ledger is authoritative; this is its sum. */
  total: () => Promise<number>;
  list: () => Promise<readonly XpTransaction[]>;
};

export type MasteryRepository = {
  get: (skillId: SkillId) => Promise<SkillMastery | null>;
  getMany: (skillIds: readonly SkillId[]) => Promise<readonly SkillMastery[]>;
};

export type ReviewRepository = {
  get: (skillId: SkillId) => Promise<ReviewItem | null>;
  listAll: () => Promise<readonly ReviewItem[]>;
  listDue: (atIso: string) => Promise<readonly ReviewItem[]>;
};

export type MistakeRepository = {
  listUnresolved: () => Promise<readonly Mistake[]>;
  resolveForSkill: (skillId: SkillId, atIso: string) => Promise<void>;
};

export type DailyActivityRepository = {
  listQualifyingDates: () => Promise<readonly LocalDate[]>;
  get: (localDate: LocalDate) => Promise<DailyActivity | null>;
};

/**
 * Hearts are stored as a count plus the instant it was written; the current
 * balance is derived from elapsed time by the policy, never by the store.
 */
export type HeartsRepository = {
  read: () => Promise<HeartsRecord | null>;
  write: (record: HeartsRecord) => Promise<void>;
};

export type LearnerProfileRepository = {
  read: () => Promise<LearnerProfile | null>;
  write: (profile: LearnerProfile) => Promise<void>;
};

/**
 * The one write that must be all-or-nothing.
 *
 * Completing a session touches the session, its attempts, three kinds of XP,
 * path progression, the day's activity, mastery, review schedules, and
 * mistakes. A partially persisted completion — XP without attempts, a completed
 * node without a session, an İz day without a completed session — is worse than
 * a failed one, so infrastructure commits it in a single exclusive transaction.
 */
export type SessionCompletionInput = {
  attempts: readonly StoredAttempt[];
  /** Evidence per scored attempt, already reduced to what the policies need. */
  evidence: readonly {
    correct: boolean;
    exerciseId: string;
    observedAtIso: string;
    skillIds: readonly SkillId[];
    strength: 'strong' | 'weak';
  }[];
  completedAtIso: string;
  correctScoredCount: number;
  lessonId: LessonId;
  localDate: LocalDate;
  readonly pathNodeId?: PathNodeId;
  session: StoredSession;
  timeZone: string;
};

export type SessionCompletionResult = {
  /** XP actually written, after idempotency filtering. */
  awardedXp: number;
  firstCompletionAwarded: boolean;
  /** True when the completion had already been committed by an earlier attempt. */
  alreadyCompleted: boolean;
};

export type CompletionRepository = {
  completeSession: (input: SessionCompletionInput) => Promise<SessionCompletionResult>;
};

export type ProgressRepositories = {
  attempts: AttemptRepository;
  completion: CompletionRepository;
  dailyActivity: DailyActivityRepository;
  hearts: HeartsRepository;
  mastery: MasteryRepository;
  profile: LearnerProfileRepository;
  mistakes: MistakeRepository;
  progress: ProgressRepository;
  review: ReviewRepository;
  sessionProgress: SessionProgressRepository;
  sessions: SessionRepository;
  statistics: LearnerStatisticsRepository;
  xp: XpRepository;
};
