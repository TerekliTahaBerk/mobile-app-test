import type { LessonId, PathNodeId, SkillId } from '@/modules/curriculum/domain/content-types';
import { recommendNext } from '@/modules/progress/domain/recommendation-policy';
import { SESSION_SNAPSHOT_VERSION, type Mistake, type ReviewItem, type StoredSession } from '@/modules/progress/domain/progress-types';

const NOW = Date.parse('2026-08-27T18:00:00.000Z');
const SKILL_ID = 'skill.test.001' as SkillId;

const NEXT_LESSON = {
  lessonId: 'lesson.test.002' as LessonId,
  pathNodeId: 'path.test.002' as PathNodeId,
};

function dueItem(skillId: SkillId, dueAt = '2026-08-26T00:00:00.000Z'): ReviewItem {
  return { dueAt, skillId, stage: 1, updatedAt: dueAt };
}

function mistake(skillId: SkillId, id = 'm1'): Mistake {
  return {
    createdAt: '2026-08-20T00:00:00.000Z',
    id,
    skillId,
    sourceExerciseId: 'ex.1' as never,
    sourceLessonId: 'lesson.test.001' as LessonId,
    status: 'unresolved',
  };
}

const ACTIVE_SESSION: StoredSession = {
  contentVersion: '1',
  currentExerciseIndex: 2,
  kind: 'lesson',
  lessonId: 'lesson.test.001' as LessonId,
  sessionId: 's1',
  snapshot: '{}',
  snapshotVersion: SESSION_SNAPSHOT_VERSION,
  startedAt: '2026-08-27T17:00:00.000Z',
  status: 'active',
  updatedAt: '2026-08-27T17:30:00.000Z',
};

describe('recommendation', () => {
  it('offers new material when nothing is outstanding', () => {
    expect(
      recommendNext({
        activeSession: null,
        atMs: NOW,
        nextLesson: NEXT_LESSON,
        reviewItems: [],
        unresolvedMistakes: [],
      }),
    ).toMatchObject({ kind: 'lesson', reason: 'newLesson' });
  });

  it('prefers resuming an unfinished session over starting a new lesson', () => {
    expect(
      recommendNext({
        activeSession: ACTIVE_SESSION,
        atMs: NOW,
        nextLesson: NEXT_LESSON,
        reviewItems: [],
        unresolvedMistakes: [],
      }),
    ).toEqual({ kind: 'resume', reason: 'resume', sessionId: 's1' });
  });

  it('prefers a due review over resuming', () => {
    expect(
      recommendNext({
        activeSession: ACTIVE_SESSION,
        atMs: NOW,
        nextLesson: NEXT_LESSON,
        reviewItems: [dueItem(SKILL_ID)],
        unresolvedMistakes: [],
      }),
    ).toEqual({ kind: 'review', reason: 'review', skillId: SKILL_ID });
  });

  it('offers a skill that is both a mistake and a review only once, as a mistake', () => {
    expect(
      recommendNext({
        activeSession: null,
        atMs: NOW,
        nextLesson: NEXT_LESSON,
        reviewItems: [dueItem(SKILL_ID)],
        unresolvedMistakes: [mistake(SKILL_ID)],
      }),
    ).toEqual({ kind: 'mistake', reason: 'mistake', skillId: SKILL_ID });
  });

  it('ignores reviews that are not due yet', () => {
    expect(
      recommendNext({
        activeSession: null,
        atMs: NOW,
        nextLesson: null,
        reviewItems: [dueItem(SKILL_ID, '2026-09-10T00:00:00.000Z')],
        unresolvedMistakes: [],
      }),
    ).toEqual({ kind: 'none', reason: 'newLesson' });
  });
});
