import { authoredExercise } from '../support/content-fixtures';

import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import type { LessonId } from '@/modules/curriculum/domain/content-types';
import type { DailyActivity, StoredAttempt } from '@/modules/progress/domain/progress-types';
import { buildWeeklyReport, type ReportDay } from '@/modules/progress/domain/weekly-report';

const index = createContentIndex(tytDraftBundle);
/** A Wednesday, so "the week ending on Sunday" is not the week containing today. */
const moment = { atMs: Date.parse('2026-09-02T09:00:00.000Z'), timeZone: 'Europe/Istanbul' };

function attempt(id: string, exerciseId: string, correct: boolean, day: string): StoredAttempt {
  return {
    answer: '{}',
    attemptNumber: 1,
    correct,
    exerciseId: authoredExercise(exerciseId),
    id,
    lessonId: 'lesson.history.states.001' as LessonId,
    occurredAt: `${day}T09:00:00.000Z`,
    scored: true,
    sessionId: `session-${id}`,
  };
}

function activity(localDate: string, qualifyingSessions: number): DailyActivity {
  return {
    firstActivityAt: `${localDate}T09:00:00.000Z`,
    lastActivityAt: `${localDate}T10:00:00.000Z`,
    localDate,
    qualifyingSessions,
    timeZone: 'Europe/Istanbul',
    xpEarned: 40,
  };
}

function reportOf(
  attempts: readonly StoredAttempt[],
  dailyActivity: readonly DailyActivity[] = [],
  reportDay: ReportDay = 0,
) {
  return buildWeeklyReport({ attempts, dailyActivity, index, moment, reportDay });
}

describe('weekly report', () => {
  it('runs the week to the chosen day rather than to today', () => {
    const sunday = reportOf([]);
    const wednesday = reportOf([], [], 3);

    // Today is a Wednesday, so the Sunday week is still four days from closing.
    expect(sunday).toMatchObject({ closed: false, from: '2026-08-31', to: '2026-09-06' });
    // A Wednesday report closes on today itself, so it is final.
    expect(wednesday).toMatchObject({ closed: true, from: '2026-08-27', to: '2026-09-02' });
  });

  it('counts only the answers that fall inside the reported week', () => {
    const report = reportOf([
      attempt('before', 'exercise.history.states.001.mcq01', true, '2026-08-30'),
      attempt('inside', 'exercise.history.states.001.mcq02', true, '2026-08-31'),
      attempt('inside2', 'exercise.history.kurultay.001.mcq01', false, '2026-09-01'),
      // Today is 2 September; nothing later than that can exist yet.
    ]);

    expect(report).toMatchObject({ accuracy: 0.5, correctAnswers: 1, questions: 2 });
  });

  it('compares the week against the week before it', () => {
    const report = reportOf([
      // Previous week: one of two right.
      attempt('p1', 'exercise.history.states.001.mcq01', true, '2026-08-24'),
      attempt('p2', 'exercise.history.states.001.mcq02', false, '2026-08-25'),
      // Reported week: both right.
      attempt('c1', 'exercise.history.kurultay.001.mcq01', true, '2026-08-31'),
      attempt('c2', 'exercise.history.kurultay.001.match01', true, '2026-09-01'),
    ]);

    expect(report.accuracyDelta).toBeCloseTo(0.5);
  });

  it('says nothing about a change it cannot measure', () => {
    const report = reportOf([
      attempt('c1', 'exercise.history.states.001.mcq01', true, '2026-08-31'),
    ]);

    expect(report).toMatchObject({ accuracy: 1, accuracyDelta: null });
  });

  it('reports a subtopic that became strong during the week', () => {
    const report = reportOf([
      // A miss and a hit before the week: not strong going in.
      attempt('b1', 'exercise.history.states.001.mcq01', false, '2026-08-10'),
      attempt('b2', 'exercise.history.states.001.mcq02', true, '2026-08-11'),
      // A clean run inside the week takes it over the bar.
      attempt('c1', 'exercise.history.states.001.mcq01', true, '2026-08-31'),
      attempt('c2', 'exercise.history.states.001.mcq02', true, '2026-09-01'),
      attempt('c3', 'exercise.history.states.001.mcq01', true, '2026-09-02'),
      attempt('c4', 'exercise.history.states.001.mcq02', true, '2026-09-02'),
    ]);

    expect(report.strengthened.map((topic) => topic.title)).toContain('İlk Türk Devletleri');
    expect(report.stillWeak.map((topic) => topic.title)).not.toContain('İlk Türk Devletleri');
  });

  it('does not re-announce a strength the learner already had', () => {
    const already = [
      attempt('b1', 'exercise.history.states.001.mcq01', true, '2026-08-10'),
      attempt('b2', 'exercise.history.states.001.mcq02', true, '2026-08-11'),
      attempt('b3', 'exercise.history.states.001.mcq01', true, '2026-08-12'),
    ];
    const report = reportOf([
      ...already,
      attempt('c1', 'exercise.history.states.001.mcq02', true, '2026-08-31'),
    ]);

    expect(report.strengthened).toEqual([]);
  });

  it('lists what the week closed on still needing practice, weakest first', () => {
    const report = reportOf([
      attempt('a1', 'exercise.history.states.001.mcq01', false, '2026-08-31'),
      attempt('a2', 'exercise.history.states.001.mcq02', false, '2026-09-01'),
      attempt('a3', 'exercise.history.kurultay.001.mcq01', false, '2026-09-01'),
      attempt('a4', 'exercise.history.kurultay.001.match01', false, '2026-09-02'),
      attempt('a5', 'exercise.history.kurultay.001.mcq01', true, '2026-09-02'),
    ]);

    const accuracies = report.stillWeak.map((topic) => topic.accuracy);
    expect(report.stillWeak.length).toBeGreaterThan(1);
    expect(accuracies).toEqual([...accuracies].sort((left, right) => left - right));
  });

  it('counts rounds and study days from the days inside the week', () => {
    const report = reportOf(
      [],
      [
        activity('2026-08-30', 2),
        activity('2026-08-31', 1),
        activity('2026-09-01', 3),
        activity('2026-09-07', 5),
      ],
    );

    expect(report).toMatchObject({ activeDays: 2, rounds: 4 });
  });
});
