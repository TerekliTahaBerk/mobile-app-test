import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { isScoredKind, type ExerciseId, type LessonId } from '@/modules/curriculum/domain/content-types';
import {
  buildDailyPlan,
  DAILY_PLAN_QUOTAS,
  DAILY_PLAN_TARGET,
  type DailyPlanInput,
} from '@/modules/learning/domain/daily-plan';
import type { StoredAttempt } from '@/modules/progress/domain/progress-types';
import { buildTopicPerformance } from '@/modules/progress/domain/topic-performance';

const NOW = '2026-08-28T10:00:00.000Z';
const moment = { atMs: Date.parse(NOW), timeZone: 'Europe/Istanbul' };
const index = createContentIndex(tytDraftBundle);

function attempt(
  id: string,
  exerciseId: string,
  correct: boolean,
  occurredAt = NOW,
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

function planFor(overrides: Partial<DailyPlanInput> = {}) {
  const attempts = overrides.attempts ?? [];

  return buildDailyPlan({
    attempts,
    dueSkillIds: [],
    index,
    newLessonIds: tytDraftBundle.lessons.map((lesson) => lesson.id),
    topics: buildTopicPerformance(attempts, index, { moment }).topics,
    ...overrides,
  });
}

/** The subtopic a question is filed under, as the plan itself groups them. */
function topicOf(exerciseId: string): string {
  return index.getExerciseTaxonomy(exerciseId).subtopics[0]!.id;
}

describe('daily plan', () => {
  it('fills a full day and asks only scored questions', () => {
    const plan = planFor();

    expect(plan.exercises).toHaveLength(DAILY_PLAN_TARGET);
    expect(plan.exercises.every((exercise) => isScoredKind(exercise.kind))).toBe(true);
    expect(new Set(plan.exercises.map((exercise) => exercise.id)).size).toBe(
      plan.exercises.length,
    );
  });

  it('mixes subtopics rather than blocking one after another', () => {
    const plan = planFor();
    const topics = plan.exercises.map((exercise) => topicOf(exercise.id));
    const runs = topics.filter((topic, position) => position > 0 && topic === topics[position - 1]);

    expect(plan.topicCount).toBeGreaterThan(1);
    expect(runs).toHaveLength(0);
  });

  it('is deterministic for the same record', () => {
    const attempts = [attempt('a1', 'exercise.history.states.001.mcq01', false)];

    expect(planFor({ attempts }).exercises.map((exercise) => exercise.id)).toEqual(
      planFor({ attempts }).exercises.map((exercise) => exercise.id),
    );
  });

  it('spends its weak-topic budget on the subtopics the record says are weak', () => {
    const attempts = [
      attempt('a1', 'exercise.history.states.001.mcq01', false),
      attempt('a2', 'exercise.history.states.001.mcq02', false),
    ];
    const plan = planFor({ attempts });
    const weak = plan.parts.find((part) => part.kind === 'weakTopic');

    expect(weak?.exercises.length).toBe(DAILY_PLAN_QUOTAS.weakTopic);
    expect(weak?.topicTitles).toContain('İlk Türk Devletleri');
  });

  it('schedules due reviews as their own explained part', () => {
    const skillId = tytDraftBundle.skills[0]!.id;
    const plan = planFor({ dueSkillIds: [skillId] });
    const review = plan.parts.find((part) => part.kind === 'review');

    expect(review).toBeDefined();
    expect(review!.exercises.length).toBeGreaterThan(0);
    expect(
      review!.exercises.every((exercise) => exercise.skillIds.includes(skillId)),
    ).toBe(true);
  });

  it('counts only questions the learner has never answered as new material', () => {
    const firstNew = planFor().parts.find((part) => part.kind === 'newMaterial')!.exercises[0]!;
    const plan = planFor({ attempts: [attempt('seen', firstNew.id, true)] });
    const newMaterial = plan.parts.find((part) => part.kind === 'newMaterial');

    expect(newMaterial?.exercises.some((exercise) => exercise.id === firstNew.id)).toBe(false);
  });

  it('reports a short day honestly instead of padding it', () => {
    const plan = planFor({ newLessonIds: [] });

    expect(plan.exercises.length).toBeLessThan(DAILY_PLAN_TARGET);
    expect(plan.parts.every((part) => part.exercises.length > 0)).toBe(true);
  });

  it('has nothing to offer when there is no open material at all', () => {
    const plan = buildDailyPlan({
      attempts: [],
      dueSkillIds: [],
      index,
      newLessonIds: [],
      topics: [],
    });

    expect(plan.exercises).toHaveLength(0);
    expect(plan.parts).toHaveLength(0);
  });
});
