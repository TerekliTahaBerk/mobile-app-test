import type { LessonSession } from '@/modules/learning/domain/lesson-session';
import {
  CONTENT_VERSION,
  restoreSession,
  toEvidence,
  toStoredSession,
} from '@/modules/progress/application/lesson-persistence';
import { SESSION_SNAPSHOT_VERSION } from '@/modules/progress/domain/progress-types';

const session: LessonSession = {
  attempts: [
    {
      answer: { kind: 'flashcard', selfReport: 'known' },
      attemptNumber: 1,
      correct: true,
      exerciseId: 'exercise.history.states.001.card01',
      lessonId: 'lesson.history.states.001',
      occurredAt: '2026-08-27T10:01:00.000Z',
      scored: false,
      skillIds: ['skill.history.states.identify'],
    },
    {
      answer: { kind: 'multipleChoice', optionId: 'opt-uygur' },
      attemptNumber: 1,
      correct: false,
      exerciseId: 'exercise.history.states.001.mcq01',
      lessonId: 'lesson.history.states.001',
      occurredAt: '2026-08-27T10:02:00.000Z',
      scored: true,
      skillIds: ['skill.history.states.identify', 'skill.history.states.chronology'],
    },
  ],
  currentIndex: 1,
  exerciseIds: [
    'exercise.history.states.001.card01',
    'exercise.history.states.001.mcq01',
  ],
  lessonId: 'lesson.history.states.001',
  pathNodeId: 'path.history.first-turkish-states.01',
  phase: 'feedback',
  startedAt: '2026-08-27T10:00:00.000Z',
  status: 'active',
  xpEarned: 0,
};

describe('durable lesson snapshots', () => {
  it('round-trips domain state needed for a mid-lesson resume', () => {
    const stored = toStoredSession(session, 'lesson', '2026-08-27T10:03:00.000Z');

    expect(restoreSession(stored)).toEqual(session);
    expect(stored).toMatchObject({
      contentVersion: CONTENT_VERSION,
      currentExerciseIndex: 1,
      snapshotVersion: SESSION_SNAPSHOT_VERSION,
      status: 'active',
    });
  });

  it('stores the durable purpose and topic-result context outside the engine snapshot', () => {
    const stored = toStoredSession(
      session,
      'review',
      '2026-08-27T10:03:00.000Z',
      'topicPractice',
      { beforeAccuracy: 0.4, topicId: 'topic.history.states' },
    );

    expect(stored).toMatchObject({
      context: { beforeAccuracy: 0.4, topicId: 'topic.history.states' },
      kind: 'review',
      purpose: 'topicPractice',
    });
    expect(restoreSession(stored)).toEqual(session);
  });

  it('refuses stale content and malformed snapshots without crashing', () => {
    const stored = toStoredSession(session, 'lesson', '2026-08-27T10:03:00.000Z');

    expect(restoreSession({ ...stored, contentVersion: 'old-content' })).toBeNull();
    expect(restoreSession({ ...stored, snapshot: '{broken' })).toBeNull();
  });

  it('excludes flashcards and preserves deterministic multi-skill scored evidence', () => {
    expect(toEvidence(session)).toEqual([
      {
        correct: false,
        exerciseId: 'exercise.history.states.001.mcq01',
        observedAtIso: '2026-08-27T10:02:00.000Z',
        skillIds: ['skill.history.states.identify', 'skill.history.states.chronology'],
        strength: 'weak',
      },
    ]);
  });
});
