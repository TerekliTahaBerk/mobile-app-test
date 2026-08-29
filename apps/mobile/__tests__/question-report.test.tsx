import { fireEvent, render, screen } from '@testing-library/react-native';

import { authoredExercise } from './support/content-fixtures';

import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { buildDailyPlan } from '@/modules/learning/domain/daily-plan';
import { assemblePlacement } from '@/modules/learning/domain/placement';
import { assembleTargetedPractice } from '@/modules/learning/domain/targeted-practice';
import { FeedbackSheet } from '@/modules/learning/ui/feedback-sheet';
import { buildTopicPerformance } from '@/modules/progress/domain/topic-performance';

const index = createContentIndex(tytDraftBundle);
const moment = { atMs: Date.parse('2026-08-29T10:00:00.000Z'), timeZone: 'Europe/Istanbul' };

function renderSheet(overrides: Partial<Parameters<typeof FeedbackSheet>[0]> = {}) {
  return render(
    <FeedbackSheet
      correct={false}
      correctAnswerSummary="Ay yılı esaslı olması"
      explanation="Hicri takvim ay yılı esaslıdır."
      onContinue={jest.fn()}
      onReport={jest.fn()}
      xpAwarded={null}
      {...overrides}
    />,
  );
}

describe('reporting a question', () => {
  it('offers fixed reasons and never asks the learner to write', async () => {
    await renderSheet();
    await fireEvent.press(screen.getByTestId('report-question'));

    expect(screen.getByTestId('report-wrongQuestion')).toBeTruthy();
    expect(screen.getByTestId('report-wrongAnswer')).toBeTruthy();
    expect(screen.getByTestId('report-confusingExplanation')).toBeTruthy();
    expect(screen.getByTestId('report-typo')).toBeTruthy();
    // No free-form learner text is captured anywhere in the app.
    expect(screen.queryByPlaceholderText(/.*/)).toBeNull();
  });

  it('reports the chosen reason once and then says so', async () => {
    const onReport = jest.fn();

    await renderSheet({ onReport });
    await fireEvent.press(screen.getByTestId('report-question'));
    await fireEvent.press(screen.getByTestId('report-wrongAnswer'));

    expect(onReport).toHaveBeenCalledWith('wrongAnswer');
    expect(screen.getByText('Bildirimin kaydedildi. Teşekkürler.')).toBeTruthy();
    expect(screen.queryByTestId('report-wrongAnswer')).toBeNull();
  });

  it('hides reporting where it cannot be stored', async () => {
    await renderSheet({ onReport: undefined });

    expect(screen.queryByTestId('report-question')).toBeNull();
  });

  it('never blocks the way forward', async () => {
    const onContinue = jest.fn();

    await renderSheet({ onContinue });
    await fireEvent.press(screen.getByTestId('report-question'));
    await fireEvent.press(screen.getByTestId('feedback-continue'));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});

describe('a reported question', () => {
  const reported = new Set([authoredExercise('exercise.history.states.001.mcq01')]);

  it('is left out of a targeted drill', () => {
    const topicId = 'tyt.history.first-turkish-states.states';
    const practice = assembleTargetedPractice(topicId, index, 5, [], reported);

    expect(practice.exercises.map((exercise) => exercise.id)).not.toContain(
      'exercise.history.states.001.mcq01',
    );
    expect(practice.exercises.length).toBeGreaterThan(0);
  });

  it('is left out of the daily plan', () => {
    const plan = buildDailyPlan({
      attempts: [],
      dueSkillIds: [],
      index,
      newLessonIds: tytDraftBundle.lessons.map((lesson) => lesson.id),
      reportedExerciseIds: reported,
      topics: buildTopicPerformance([], index, { moment }).topics,
    });

    expect(plan.exercises.map((exercise) => exercise.id)).not.toContain(
      'exercise.history.states.001.mcq01',
    );
  });

  it('is left out of the starting diagnostic', () => {
    const placement = assemblePlacement(index, reported);

    expect(placement.exercises.map((exercise) => exercise.id)).not.toContain(
      'exercise.history.states.001.mcq01',
    );
  });

  it('still belongs to its authored lesson, so the curriculum keeps its shape', () => {
    const lesson = tytDraftBundle.lessons.find((candidate) =>
      candidate.exerciseIds.includes('exercise.history.states.001.mcq01'),
    );

    expect(lesson?.exerciseIds).toContain('exercise.history.states.001.mcq01');
  });
});
