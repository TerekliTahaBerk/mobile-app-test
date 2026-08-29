import { authoredExercise } from '../support/content-fixtures';

import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import type { LessonId } from '@/modules/curriculum/domain/content-types';
import { buildDailyPlan } from '@/modules/learning/domain/daily-plan';
import { buildPlacementResultViewModel } from '@/modules/onboarding/model/build-placement-result-view-model';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';
import { buildTopicPerformance } from '@/modules/progress/domain/topic-performance';

const index = createContentIndex(tytDraftBundle);
const moment = { atMs: Date.parse('2026-08-28T18:00:00.000Z'), timeZone: 'Europe/Istanbul' };

function attempt(id: string, exerciseId: string, correct: boolean): StoredAttempt {
  return {
    answer: '{}',
    attemptNumber: 1,
    correct,
    exerciseId: authoredExercise(exerciseId),
    id,
    lessonId: 'lesson.history.states.001' as LessonId,
    occurredAt: '2026-08-28T10:00:00.000Z',
    scored: true,
    sessionId: 'placement',
  };
}

/** The report and plan a finished diagnostic would leave behind. */
function resultOf(attempts: readonly StoredAttempt[]) {
  const topicPerformance = buildTopicPerformance(attempts, index, { moment });

  return buildPlacementResultViewModel({
    dailyPlan: buildDailyPlan({
      attempts,
      dueSkillIds: [],
      index,
      newLessonIds: tytDraftBundle.lessons.map((lesson) => lesson.id),
      topics: topicPerformance.topics,
    }),
    topicPerformance,
  });
}

describe('starting map', () => {
  it('counts what the diagnostic actually measured', () => {
    const result = resultOf([
      attempt('a1', 'exercise.history.states.001.mcq01', true),
      attempt('a2', 'exercise.history.states.001.mcq02', false),
      attempt('a3', 'exercise.history.kurultay.001.mcq01', true),
    ]);

    expect(result.detail).toBe('3 sorudan 2 doğru · 2 alt konu ölçüldü');
    expect(result.rows).toHaveLength(2);
  });

  it('opens on the subtopic most worth working, not on an alphabet', () => {
    const result = resultOf([
      // Two subtopics measured, one clearly weaker than the other.
      attempt('a1', 'exercise.history.states.001.mcq01', false),
      attempt('a2', 'exercise.history.states.001.mcq02', false),
      attempt('a3', 'exercise.history.kurultay.001.mcq01', true),
      attempt('a4', 'exercise.history.kurultay.001.match01', true),
    ]);

    const accuracies = result.rows.map((row) => Number(row.accuracyLabel.replace('%', '')));
    expect(accuracies).toEqual([...accuracies].sort((left, right) => left - right));
    expect(result.rows[0]?.statusLabel).toBe('Tekrar gerekli');
  });

  it('offers the first plan it can actually assemble', () => {
    const result = resultOf([attempt('a1', 'exercise.history.states.001.mcq01', false)]);

    expect(result.plan?.headline).toMatch(/^Bugün \d+ soru$/);
    expect(result.plan?.lines.every((line) => line.count > 0)).toBe(true);
  });
});
