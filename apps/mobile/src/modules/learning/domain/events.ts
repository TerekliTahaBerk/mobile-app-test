import type {
  ExerciseId,
  LessonId,
  PathNodeId,
  SkillId,
  Timestamp,
} from '@/modules/curriculum/domain/content-types';

/**
 * Domain events emitted by the lesson engine.
 *
 * They carry stable IDs and nothing else — no React, no view models, no free
 * text the learner typed. These are the seam that persistence, analytics,
 * mastery, and review scheduling will all consume later; nothing subscribes to
 * them yet.
 */

export type XpReason = 'correctExercise' | 'lessonCompletion';

export type DomainEvent =
  | { at: Timestamp; attemptNumber: number; correct: boolean; exerciseId: ExerciseId; type: 'AnswerSubmitted' }
  | { at: Timestamp; exerciseId: ExerciseId; type: 'AnswerCorrect' }
  | { at: Timestamp; exerciseId: ExerciseId; type: 'AnswerIncorrect' }
  | { at: Timestamp; attemptNumber: number; exerciseId: ExerciseId; type: 'AttemptRecorded' }
  | { at: Timestamp; exerciseId: ExerciseId; scored: boolean; type: 'ExerciseCompleted' }
  | { at: Timestamp; correct: boolean; exerciseId: ExerciseId; skillIds: readonly SkillId[]; type: 'SkillEvidenceObserved' }
  | { amount: number; at: Timestamp; reason: XpReason; type: 'XpEarned' }
  | { at: Timestamp; exerciseId: ExerciseId; skillIds: readonly SkillId[]; type: 'MistakeRecorded' }
  | { at: Timestamp; lessonId: LessonId; type: 'LessonStarted' }
  | {
      at: Timestamp;
      correctCount: number;
      /**
       * XP the progression layer should add *if* this is the learner's first
       * completion of the owning path level. The engine cannot know that — it
       * holds no history — so it reports the candidate and lets persistence
       * decide. See docs/GAMIFICATION.md.
       */
      firstCompletionBonusXp: number;
      incorrectCount: number;
      lessonId: LessonId;
      readonly pathNodeId?: PathNodeId;
      scoredCount: number;
      sessionXp: number;
      type: 'LessonCompleted';
    }
  | { at: Timestamp; lessonId: LessonId; type: 'LessonAbandoned' };

export type DomainEventType = DomainEvent['type'];
