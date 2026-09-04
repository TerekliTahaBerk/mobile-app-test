import type { ExerciseId, LessonId, PathNodeId, SkillId } from '@/modules/curriculum/domain/content-types';
import type {
  ProgressRepositories,
  SessionCompletionInput,
} from '@/modules/progress/application/repositories';
import { SESSION_SNAPSHOT_VERSION, type StoredSession } from '@/modules/progress/domain/progress-types';
import { migrateToLatest } from '@/modules/progress/infrastructure/migrations';
import { createSqliteRepositories } from '@/modules/progress/infrastructure/sqlite-repositories';

import { createTestDatabase } from '../support/node-sqlite-database';

const LESSON_ID = 'lesson.history.kurultay.001' as LessonId;
const PATH_NODE_ID = 'path.history.first-turkish-states.03' as PathNodeId;
const SKILL_ID = 'skill.history.kurultay-function' as SkillId;
const COMPLETED_AT = '2026-08-27T18:00:00.000Z';

function session(sessionId: string, overrides: Partial<StoredSession> = {}): StoredSession {
  return {
    contentVersion: '1',
    context: {},
    currentExerciseIndex: 3,
    kind: 'lesson',
    lessonId: LESSON_ID,
    pathNodeId: PATH_NODE_ID,
    purpose: 'lesson',
    sessionId,
    snapshot: '{}',
    snapshotVersion: SESSION_SNAPSHOT_VERSION,
    startedAt: '2026-08-27T17:50:00.000Z',
    status: 'active',
    updatedAt: '2026-08-27T17:55:00.000Z',
    ...overrides,
  };
}

function completion(
  sessionId: string,
  overrides: Partial<SessionCompletionInput> = {},
): SessionCompletionInput {
  const stored = overrides.session ?? session(sessionId);

  return {
    attempts: [
      {
        answer: 'a',
        attemptNumber: 1,
        correct: true,
        exerciseId: 'ex.1' as ExerciseId,
        id: `${sessionId}:ex.1:1`,
        lessonId: LESSON_ID,
        occurredAt: COMPLETED_AT,
        scored: true,
        sessionId,
      },
      {
        answer: 'b',
        attemptNumber: 1,
        correct: false,
        exerciseId: 'ex.2' as ExerciseId,
        id: `${sessionId}:ex.2:1`,
        lessonId: LESSON_ID,
        occurredAt: COMPLETED_AT,
        scored: true,
        sessionId,
      },
    ],
    completedAtIso: COMPLETED_AT,
    correctScoredCount: 1,
    evidence: [
      {
        correct: true,
        exerciseId: 'ex.1',
        observedAtIso: COMPLETED_AT,
        skillIds: [SKILL_ID],
        strength: 'strong',
      },
      {
        correct: false,
        exerciseId: 'ex.2',
        observedAtIso: COMPLETED_AT,
        skillIds: ['skill.history.kurultay-membership' as SkillId],
        strength: 'strong',
      },
    ],
    lessonId: LESSON_ID,
    localDate: '2026-08-27',
    pathNodeId: PATH_NODE_ID,
    timeZone: 'Europe/Istanbul',
    ...overrides,
    session: stored,
  };
}

async function setup(): Promise<ProgressRepositories> {
  const db = createTestDatabase();
  await migrateToLatest(db);

  return createSqliteRepositories(db);
}

describe('progress repositories', () => {
  it('commits a completion across every table', async () => {
    const repositories = await setup();

    const result = await repositories.completion.completeSession(completion('s1'));

    // 10 for the correct exercise + 20 lesson completion + 25 first path level.
    expect(result).toEqual({
      alreadyCompleted: false,
      awardedXp: 55,
      firstCompletionAwarded: true,
    });
    await expect(repositories.xp.total()).resolves.toBe(55);

    const stored = await repositories.sessions.get('s1');
    expect(stored?.status).toBe('completed');
    expect(stored?.completedAt).toBe(COMPLETED_AT);

    await expect(repositories.attempts.listForSession('s1')).resolves.toHaveLength(2);

    const progress = await repositories.progress.get(PATH_NODE_ID);
    expect(progress).toMatchObject({ completionCount: 1, status: 'completed' });

    await expect(repositories.dailyActivity.listQualifyingDates()).resolves.toEqual([
      '2026-08-27',
    ]);

    const mastery = await repositories.mastery.get(SKILL_ID);
    expect(mastery).toMatchObject({ alpha: 2, beta: 3, evidenceCount: 1 });

    const mistakes = await repositories.mistakes.listUnresolved();
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]?.skillId).toBe('skill.history.kurultay-membership');
  });

  it('persists a wrong answer immediately, before lesson completion', async () => {
    const repositories = await setup();
    const active = session('active-session');
    const wrongAttempt = completion('active-session').attempts[1]!;

    await repositories.sessionProgress.save(active, [wrongAttempt]);

    await expect(repositories.attempts.listAllScored()).resolves.toEqual([wrongAttempt]);
    await expect(repositories.sessions.get('active-session')).resolves.toMatchObject({
      status: 'active',
    });
    await expect(repositories.progress.get(PATH_NODE_ID)).resolves.toMatchObject({
      status: 'started',
    });
  });

  it('is idempotent: re-committing the same session awards nothing further', async () => {
    const repositories = await setup();

    await repositories.completion.completeSession(completion('s1'));
    const second = await repositories.completion.completeSession(completion('s1'));

    expect(second).toEqual({
      alreadyCompleted: true,
      awardedXp: 0,
      firstCompletionAwarded: false,
    });
    await expect(repositories.xp.total()).resolves.toBe(55);

    const activity = await repositories.dailyActivity.get('2026-08-27');
    expect(activity?.qualifyingSessions).toBe(1);
  });

  it('derives correct answers and perfect rounds from durable attempts', async () => {
    const repositories = await setup();
    await repositories.completion.completeSession(completion('mixed'));
    await repositories.completion.completeSession(
      completion('perfect', {
        attempts: [
          {
            answer: 'a',
            attemptNumber: 1,
            correct: true,
            exerciseId: 'ex.1' as ExerciseId,
            id: 'perfect:ex.1:1',
            lessonId: LESSON_ID,
            occurredAt: COMPLETED_AT,
            scored: true,
            sessionId: 'perfect',
          },
        ],
        evidence: [
          {
            correct: true,
            exerciseId: 'ex.1',
            observedAtIso: COMPLETED_AT,
            skillIds: [SKILL_ID],
            strength: 'strong',
          },
        ],
        session: session('perfect'),
      }),
    );

    await expect(repositories.statistics.read()).resolves.toEqual({
      correctAnswers: 2,
      perfectRounds: 1,
    });
  });

  it('pays the first-completion bonus once per path node, even in a new session', async () => {
    const repositories = await setup();

    await repositories.completion.completeSession(completion('s1'));
    const replay = await repositories.completion.completeSession(completion('s2'));

    expect(replay.firstCompletionAwarded).toBe(false);
    // The replay earns exercise + lesson XP only: 55 + 30.
    expect(replay.awardedXp).toBe(30);
    await expect(repositories.xp.total()).resolves.toBe(85);

    const progress = await repositories.progress.get(PATH_NODE_ID);
    expect(progress?.completionCount).toBe(2);
    expect(progress?.firstCompletedAt).toBe(COMPLETED_AT);
  });

  it('keeps one İz date while counting multiple qualifying sessions and preserves its first timezone', async () => {
    const repositories = await setup();

    await repositories.completion.completeSession(completion('s1'));
    await repositories.completion.completeSession(
      completion('s2', { timeZone: 'Europe/London' }),
    );

    await expect(repositories.dailyActivity.listQualifyingDates()).resolves.toEqual([
      '2026-08-27',
    ]);
    await expect(repositories.dailyActivity.get('2026-08-27')).resolves.toMatchObject({
      qualifyingSessions: 2,
      timeZone: 'Europe/Istanbul',
    });
  });

  it('gives a review drill per-exercise XP only', async () => {
    const repositories = await setup();

    const result = await repositories.completion.completeSession(
      completion('r1', {
        session: session('r1', { kind: 'review' }),
      }),
    );

    expect(result.awardedXp).toBe(10);
    expect(result.firstCompletionAwarded).toBe(false);
  });

  it('schedules review from a miss and clears the mistake on a clean answer', async () => {
    const repositories = await setup();
    const missedSkill = 'skill.history.kurultay-membership' as SkillId;

    await repositories.completion.completeSession(completion('s1'));

    const afterMiss = await repositories.review.get(missedSkill);
    // An incorrect answer returns tomorrow at stage 0.
    expect(afterMiss).toMatchObject({ stage: 0 });
    expect(Date.parse(afterMiss?.dueAt ?? '')).toBe(
      Date.parse(COMPLETED_AT) + 24 * 60 * 60 * 1000,
    );

    await repositories.completion.completeSession(
      completion('s2', {
        session: session('s2', { kind: 'review' }),
        evidence: [
          {
            correct: true,
            exerciseId: 'ex.2',
            observedAtIso: '2026-08-28T18:00:00.000Z',
            skillIds: [missedSkill],
            strength: 'strong',
          },
        ],
      }),
    );

    await expect(repositories.mistakes.listUnresolved()).resolves.toEqual([]);
    const afterFix = await repositories.review.get(missedSkill);
    expect(afterFix?.stage).toBe(1);
  });

  it('keeps a resolved mistake readable instead of removing it', async () => {
    const repositories = await setup();
    const skillId = 'skill.history.kurultay-membership' as SkillId;

    await repositories.completion.completeSession(completion('s1'));
    await repositories.mistakes.resolveForSkill(skillId, COMPLETED_AT);

    await expect(repositories.mistakes.listUnresolved()).resolves.toEqual([]);
    const all = await repositories.mistakes.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ resolvedAt: COMPLETED_AT, status: 'resolved' });
  });

  it('reopens a mistake that recurs after being resolved', async () => {
    const repositories = await setup();
    const skillId = 'skill.history.kurultay-membership' as SkillId;

    await repositories.completion.completeSession(completion('s1'));
    await repositories.mistakes.resolveForSkill(skillId, COMPLETED_AT);
    await expect(repositories.mistakes.listUnresolved()).resolves.toEqual([]);

    await repositories.completion.completeSession(completion('s2'));

    await expect(repositories.mistakes.listUnresolved()).resolves.toHaveLength(1);
  });

  it('keeps one report per question per round, with the last reason', async () => {
    const repositories = await setup();
    const report = {
      createdAt: COMPLETED_AT,
      exerciseId: 'exercise.history.states.001.mcq01' as ExerciseId,
      id: 'report:s1:exercise.history.states.001.mcq01',
      sessionId: 's1',
    };

    await repositories.reports.record({ ...report, reason: 'typo' });
    await repositories.reports.record({ ...report, reason: 'wrongAnswer' });

    const stored = await repositories.reports.listAll();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ reason: 'wrongAnswer' });
  });

  it('surfaces only sessions that are still active for resume', async () => {
    const repositories = await setup();

    await repositories.sessions.save(session('s1'));
    await expect(repositories.sessions.findActive()).resolves.toMatchObject({ sessionId: 's1' });

    await repositories.sessions.markStale('s1', COMPLETED_AT);
    await expect(repositories.sessions.findActive()).resolves.toBeNull();
    await expect(repositories.sessions.get('s1')).resolves.toMatchObject({ status: 'stale' });
  });
});
