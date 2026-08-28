import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ExerciseId, LessonId } from '@/modules/curriculum/domain/content-types';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';
import {
  buildTopicPerformance,
  type TopicPerformanceOptions,
} from '@/modules/progress/domain/topic-performance';

const TODAY = '2026-08-28T10:00:00.000Z';

const moment = { atMs: Date.parse(TODAY), timeZone: 'Europe/Istanbul' };
const options: TopicPerformanceOptions = { moment };

function attempt(
  id: string,
  exerciseId: string,
  correct: boolean,
  occurredAt = TODAY,
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
    const report = buildTopicPerformance(
      [
        attempt('a1', 'exercise.history.states.001.mcq01', false),
        attempt('a2', 'exercise.history.states.001.mcq02', false),
        attempt('a3', 'exercise.history.kurultay.001.mcq01', true),
      ],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.topics).toHaveLength(1);
    expect(report.topics[0]).toMatchObject({
      accuracy: 1 / 3,
      band: 'needsPractice',
      correctAnswers: 1,
      totalAttempts: 3,
      wrongAnswers: 2,
    });
    expect(report.topics[0]?.subtopics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'İlk Türk Devletleri', wrongAnswers: 2 }),
        expect.objectContaining({ title: 'Kut ve Töre', correctAnswers: 1 }),
      ]),
    );
  });

  it('requires enough evidence before declaring a strength and ignores stale content ids', () => {
    const report = buildTopicPerformance(
      [
        attempt('a1', 'exercise.history.states.001.mcq01', true),
        attempt('a2', 'exercise.history.states.001.mcq01', true),
        attempt('a3', 'exercise.history.states.001.mcq01', true),
        attempt('old', 'exercise.removed', false),
      ],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.topics[0]).toMatchObject({
      band: 'strong',
      hasEnoughEvidence: true,
      totalAttempts: 3,
    });
    expect(report.attemptsAllTime).toBe(3);
  });

  it('marks a single lucky answer as evidence-poor rather than as a strength', () => {
    const report = buildTopicPerformance(
      [attempt('a1', 'exercise.history.states.001.mcq01', true)],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.topics[0]).toMatchObject({
      accuracy: 1,
      band: 'developing',
      hasEnoughEvidence: false,
      trend: 'unknown',
    });
  });

  it('reports only the attempts inside the selected window', () => {
    const attempts = [
      attempt('old', 'exercise.history.states.001.mcq01', false, '2026-07-01T09:00:00.000Z'),
      attempt('recent', 'exercise.history.states.001.mcq02', true, '2026-08-27T09:00:00.000Z'),
    ];
    const index = createContentIndex(tytDraftBundle);

    const week = buildTopicPerformance(attempts, index, { moment, window: 'last7' });
    const everything = buildTopicPerformance(attempts, index, { moment, window: 'all' });

    expect(week.attemptsInWindow).toBe(1);
    expect(week.topics[0]).toMatchObject({ correctAnswers: 1, wrongAnswers: 0 });
    expect(everything.attemptsInWindow).toBe(2);
    expect(everything.topics[0]).toMatchObject({ correctAnswers: 1, wrongAnswers: 1 });
  });

  it('reads a direction only once both halves of the window carry evidence', () => {
    const missed = ['m1', 'm2', 'm3'].map((id, position) =>
      attempt(id, 'exercise.history.states.001.mcq01', false, `2026-08-2${position + 1}T09:00:00.000Z`),
    );
    const fixed = ['f1', 'f2', 'f3'].map((id, position) =>
      attempt(id, 'exercise.history.states.001.mcq02', true, `2026-08-2${position + 4}T09:00:00.000Z`),
    );

    const report = buildTopicPerformance(
      [...missed, ...fixed],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.topics[0]?.trend).toBe('rising');
  });

  it('counts a question missed before and answered correctly today as a correction', () => {
    const report = buildTopicPerformance(
      [
        attempt('miss', 'exercise.history.states.001.mcq01', false, '2026-08-20T09:00:00.000Z'),
        attempt('fix', 'exercise.history.states.001.mcq01', true),
        // Correct on its first ever sighting, so nothing was corrected here.
        attempt('clean', 'exercise.history.kurultay.001.mcq01', true),
      ],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.correctedToday).toEqual([
      expect.objectContaining({ correctedQuestions: 1, title: 'İlk Türk Devletleri' }),
    ]);
  });

  it('separates first sightings from answers to already-seen questions', () => {
    const report = buildTopicPerformance(
      [
        attempt('first', 'exercise.history.states.001.mcq01', false, '2026-08-20T09:00:00.000Z'),
        attempt('retry', 'exercise.history.states.001.mcq01', true),
      ],
      createContentIndex(tytDraftBundle),
      options,
    );

    expect(report.topics[0]).toMatchObject({ firstAttemptAccuracy: 0, retryAccuracy: 1 });
  });

  it('flags a strength that has gone unmeasured for a long time', () => {
    const long = ['s1', 's2', 's3'].map((id, position) =>
      attempt(id, 'exercise.history.states.001.mcq01', true, `2026-07-0${position + 1}T09:00:00.000Z`),
    );

    const report = buildTopicPerformance(long, createContentIndex(tytDraftBundle), options);

    expect(report.topics[0]).toMatchObject({ band: 'strong', stale: true });
    expect(report.topics[0]?.daysSinceLastAttempt).toBeGreaterThanOrEqual(14);
  });

  it('reports how much of a main topic has actually been measured', () => {
    const index = createContentIndex(tytDraftBundle);
    const report = buildTopicPerformance(
      [attempt('a1', 'exercise.history.states.001.mcq01', true)],
      index,
      options,
    );

    const unit = index.getUnit(report.topics[0]!.id);
    expect(report.topics[0]?.coverage).toEqual({
      measured: report.topics[0]!.subtopics.length,
      total: unit.topicIds.length,
    });
    expect(report.topics[0]!.coverage.measured).toBeLessThan(report.topics[0]!.coverage.total);
  });
});
