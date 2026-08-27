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
      exerciseId: 'exercise.history.kurultay.001.card01',
      lessonId: 'lesson.history.kurultay.001',
      occurredAt: '2026-08-27T10:01:00.000Z',
      scored: false,
      skillIds: ['skill.history.kurultay.function'],
    },
    {
      answer: { kind: 'multipleChoice', optionId: 'opt-divan' },
      attemptNumber: 1,
      correct: false,
      exerciseId: 'exercise.history.kurultay.001.mcq01',
      lessonId: 'lesson.history.kurultay.001',
      occurredAt: '2026-08-27T10:02:00.000Z',
      scored: true,
      skillIds: [
        'skill.history.kurultay.function',
        'skill.history.kurultay.members',
      ],
    },
  ],
  currentIndex: 1,
  exerciseIds: [
    'exercise.history.kurultay.001.card01',
    'exercise.history.kurultay.001.mcq01',
  ],
  lessonId: 'lesson.history.kurultay.001',
  pathNodeId: 'path.history.first-turkish-states.03',
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

  it('refuses stale content and malformed snapshots without crashing', () => {
    const stored = toStoredSession(session, 'lesson', '2026-08-27T10:03:00.000Z');

    expect(restoreSession({ ...stored, contentVersion: 'old-content' })).toBeNull();
    expect(restoreSession({ ...stored, snapshot: '{broken' })).toBeNull();
  });

  it('excludes flashcards and preserves deterministic multi-skill scored evidence', () => {
    expect(toEvidence(session)).toEqual([
      {
        correct: false,
        exerciseId: 'exercise.history.kurultay.001.mcq01',
        observedAtIso: '2026-08-27T10:02:00.000Z',
        skillIds: [
          'skill.history.kurultay.function',
          'skill.history.kurultay.members',
        ],
        strength: 'weak',
      },
    ]);
  });
});
