import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ExerciseId, LessonId } from '@/modules/curriculum/domain/content-types';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';
import { buildTopicPerformance } from '@/modules/progress/domain/topic-performance';

function attempt(
  id: string,
  exerciseId: string,
  correct: boolean,
  occurredAt = '2026-08-28T10:00:00.000Z',
): StoredAttempt {
  return {
    answer: '{}',
    attemptNumber: 1,
    correct,
    exerciseId: exerciseId as ExerciseId,
    id,
    lessonId: 'lesson.history.states.001' as LessonId,
    occurredAt,
    scored: true,
    sessionId: 'session-1',
  };
}

describe('topic performance', () => {
  it('aggregates scored attempts into main topics and subtopics', () => {
    const result = buildTopicPerformance(
      [
        attempt('a1', 'exercise.history.states.001.mcq01', false),
        attempt('a2', 'exercise.history.states.001.mcq02', false),
        attempt('a3', 'exercise.history.kurultay.001.mcq01', true),
      ],
      createContentIndex(tytDraftBundle),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      accuracy: 1 / 3,
      band: 'needsPractice',
      correctAnswers: 1,
      totalAttempts: 3,
      wrongAnswers: 2,
    });
    expect(result[0]?.subtopics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'İlk Türk Devletleri', wrongAnswers: 2 }),
        expect.objectContaining({ title: 'Kut ve Töre', correctAnswers: 1 }),
      ]),
    );
  });

  it('requires enough evidence before declaring a strength and ignores stale content ids', () => {
    const result = buildTopicPerformance(
      [
        attempt('a1', 'exercise.history.states.001.mcq01', true),
        attempt('a2', 'exercise.history.states.001.mcq01', true),
        attempt('a3', 'exercise.history.states.001.mcq01', true),
        attempt('old', 'exercise.removed', false),
      ],
      createContentIndex(tytDraftBundle),
    );

    expect(result[0]).toMatchObject({ band: 'strong', totalAttempts: 3 });
  });
});
