import { getContentIndex } from '@/modules/curriculum/content/content-source';
import {
  KURULTAY_LESSON_ID,
  KURULTAY_PATH_NODE_ID,
} from '@/modules/curriculum/content/tyt-social-draft-bundle';
import type { ExerciseAnswer } from '@/modules/learning/domain/answers';
import {
  AnswerKindMismatchError,
  evaluateAnswer,
} from '@/modules/learning/domain/evaluator-registry';
import type { DomainEvent, DomainEventType } from '@/modules/learning/domain/events';
import {
  createLessonSession,
  LessonCommandError,
  reduceLessonSession,
  summarizeLessonSession,
  type LessonEngineDeps,
  type LessonSession,
} from '@/modules/learning/domain/lesson-session';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';

const index = getContentIndex();
const lesson = index.getLesson(KURULTAY_LESSON_ID);
const exercises = index.getLessonExercises(KURULTAY_LESSON_ID);
const deps: LessonEngineDeps = { exercises, lesson, pathNodeId: KURULTAY_PATH_NODE_ID };

/** Fixed clock: the engine never reads the real one. */
const T = (n: number) => `2026-01-01T10:0${n}:00.000Z`;

function correctAnswerFor(index_: number): ExerciseAnswer {
  const exercise = exercises[index_]!;
  switch (exercise.kind) {
    case 'multipleChoice':
      return { kind: 'multipleChoice', optionId: exercise.correctOptionId };
    case 'fillBlank':
      return { kind: 'fillBlank', tokenIds: [...exercise.solutionTokenIds] };
    case 'matching':
      return {
        kind: 'matching',
        pairs: Object.fromEntries(exercise.pairs.map((pair) => [pair.id, pair.right])),
      };
    case 'flashcard':
      return { kind: 'flashcard', selfReport: 'known' };
    case 'ordering':
      return { kind: 'ordering', itemIds: [...exercise.correctOrder] };
  }
}

function wrongAnswerFor(index_: number): ExerciseAnswer {
  const exercise = exercises[index_]!;
  switch (exercise.kind) {
    case 'multipleChoice':
      return {
        kind: 'multipleChoice',
        optionId: exercise.options.find((o) => o.id !== exercise.correctOptionId)!.id,
      };
    case 'fillBlank':
      return { kind: 'fillBlank', tokenIds: [exercise.bank[0]!.id] };
    case 'matching':
      return { kind: 'matching', pairs: {} };
    case 'flashcard':
      return { kind: 'flashcard', selfReport: 'unknown' };
    case 'ordering':
      return { kind: 'ordering', itemIds: [] };
  }
}

/** Drives a whole lesson, answering each exercise as instructed. */
function playThrough(answerAt: (i: number) => ExerciseAnswer): {
  events: DomainEvent[];
  session: LessonSession;
} {
  let session = createLessonSession(deps);
  const events: DomainEvent[] = [];
  let tick = 0;
  const run = (command: Parameters<typeof reduceLessonSession>[1]) => {
    const result = reduceLessonSession(session, command, deps);
    session = result.session;
    events.push(...result.events);
  };

  run({ at: T(tick++), type: 'startLesson' });
  for (let i = 0; i < exercises.length; i += 1) {
    run({ answer: answerAt(i), at: T(tick++), type: 'submitAnswer' });
    run({ at: T(tick++), type: 'continueAfterFeedback' });
  }

  return { events, session };
}

const typesOf = (events: readonly DomainEvent[]): DomainEventType[] =>
  events.map((event) => event.type);

describe('lesson session engine', () => {
  it('starts a lesson and emits LessonStarted', () => {
    const session = createLessonSession(deps);
    expect(session.status).toBe('notStarted');

    const result = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps);

    expect(result.session.status).toBe('active');
    expect(result.session.startedAt).toBe(T(0));
    expect(typesOf(result.events)).toEqual(['LessonStarted']);
  });

  it('refuses commands before the lesson is started', () => {
    const session = createLessonSession(deps);

    expect(() =>
      reduceLessonSession(session, { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' }, deps),
    ).toThrow(LessonCommandError);
  });

  it('refuses a second answer while feedback is showing', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;
    session = reduceLessonSession(
      session,
      { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' },
      deps,
    ).session;

    expect(session.phase).toBe('feedback');
    expect(() =>
      reduceLessonSession(session, { answer: correctAnswerFor(0), at: T(2), type: 'submitAnswer' }, deps),
    ).toThrow(LessonCommandError);
  });

  it('evaluates a correct scored answer and awards XP', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;
    // Step past the flashcard to reach the first scored exercise.
    session = reduceLessonSession(
      session,
      { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' },
      deps,
    ).session;
    session = reduceLessonSession(session, { at: T(2), type: 'continueAfterFeedback' }, deps).session;

    const result = reduceLessonSession(
      session,
      { answer: correctAnswerFor(1), at: T(3), type: 'submitAnswer' },
      deps,
    );

    expect(result.session.lastEvaluation?.correct).toBe(true);
    expect(result.session.xpEarned).toBe(XP_POLICY_V1.correctExercise);
    expect(typesOf(result.events)).toEqual([
      'AnswerSubmitted',
      'AttemptRecorded',
      'AnswerCorrect',
      'SkillEvidenceObserved',
      'XpEarned',
    ]);
  });

  it('evaluates an incorrect answer, records a mistake, and awards no XP', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;
    session = reduceLessonSession(
      session,
      { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' },
      deps,
    ).session;
    session = reduceLessonSession(session, { at: T(2), type: 'continueAfterFeedback' }, deps).session;

    const result = reduceLessonSession(
      session,
      { answer: wrongAnswerFor(1), at: T(3), type: 'submitAnswer' },
      deps,
    );

    expect(result.session.lastEvaluation?.correct).toBe(false);
    expect(result.session.xpEarned).toBe(0);
    expect(typesOf(result.events)).toContain('AnswerIncorrect');
    expect(typesOf(result.events)).toContain('MistakeRecorded');
    expect(typesOf(result.events)).not.toContain('XpEarned');
  });

  it('records an attempt with its exercise, lesson, skills and timestamp', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;
    session = reduceLessonSession(
      session,
      { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' },
      deps,
    ).session;

    const [attempt] = session.attempts;
    expect(attempt).toMatchObject({
      attemptNumber: 1,
      exerciseId: exercises[0]!.id,
      lessonId: KURULTAY_LESSON_ID,
      occurredAt: T(1),
    });
    expect(attempt?.skillIds.length).toBeGreaterThan(0);
  });

  it('advances to the next exercise after feedback', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;
    session = reduceLessonSession(
      session,
      { answer: correctAnswerFor(0), at: T(1), type: 'submitAnswer' },
      deps,
    ).session;

    const result = reduceLessonSession(session, { at: T(2), type: 'continueAfterFeedback' }, deps);

    expect(result.session.currentIndex).toBe(1);
    expect(result.session.phase).toBe('answering');
    expect(result.session.lastEvaluation).toBeUndefined();
    expect(typesOf(result.events)).toEqual(['ExerciseCompleted']);
  });

  it('completes the lesson after the last exercise and reports the summary', () => {
    const { events, session } = playThrough(correctAnswerFor);

    expect(session.status).toBe('completed');
    expect(session.phase).toBe('finished');
    expect(session.completedAt).toBeDefined();

    const completed = events.find((event) => event.type === 'LessonCompleted');
    expect(completed).toMatchObject({
      correctCount: 4,
      incorrectCount: 0,
      lessonId: KURULTAY_LESSON_ID,
      pathNodeId: KURULTAY_PATH_NODE_ID,
      scoredCount: 4,
    });
  });

  it('does not score the flashcard deck but still completes it', () => {
    const { session } = playThrough(correctAnswerFor);
    const summary = summarizeLessonSession(session);

    expect(summary.exerciseCount).toBe(5);
    expect(summary.scoredCount).toBe(4);
    expect(summary.accuracyPercent).toBe(100);
  });

  it('sums XP as four correct answers plus lesson completion', () => {
    const { session } = playThrough(correctAnswerFor);

    expect(session.xpEarned).toBe(4 * XP_POLICY_V1.correctExercise + XP_POLICY_V1.lessonCompletion);
  });

  it('reports the first-completion bonus as a candidate for the progression layer', () => {
    const { events } = playThrough(correctAnswerFor);
    const completed = events.find((event) => event.type === 'LessonCompleted');

    // The engine holds no history, so it never awards this itself.
    expect(completed).toMatchObject({ firstCompletionBonusXp: XP_POLICY_V1.firstPathLevelCompletion });
    const totalXpAwarded = events
      .filter((event) => event.type === 'XpEarned')
      .reduce((sum, event) => sum + (event.type === 'XpEarned' ? event.amount : 0), 0);
    expect(totalXpAwarded).toBe(4 * XP_POLICY_V1.correctExercise + XP_POLICY_V1.lessonCompletion);
  });

  it('counts every scored answer wrong when the learner misses them all', () => {
    const { session } = playThrough(wrongAnswerFor);
    const summary = summarizeLessonSession(session);

    expect(summary.correctCount).toBe(0);
    expect(summary.incorrectCount).toBe(4);
    expect(summary.accuracyPercent).toBe(0);
    expect(session.xpEarned).toBe(XP_POLICY_V1.lessonCompletion);
  });

  it('is deterministic: identical commands produce identical state and events', () => {
    const first = playThrough(correctAnswerFor);
    const second = playThrough(correctAnswerFor);

    expect(second.session).toEqual(first.session);
    expect(second.events).toEqual(first.events);
  });

  it('can be abandoned while active', () => {
    let session = createLessonSession(deps);
    session = reduceLessonSession(session, { at: T(0), type: 'startLesson' }, deps).session;

    const result = reduceLessonSession(session, { at: T(1), type: 'abandonLesson' }, deps);

    expect(result.session.status).toBe('abandoned');
    expect(typesOf(result.events)).toEqual(['LessonAbandoned']);
  });
});

describe('evaluator registry', () => {
  it('rejects an answer whose kind does not match its exercise', () => {
    const mcq = exercises.find((exercise) => exercise.kind === 'multipleChoice')!;

    expect(() => evaluateAnswer(mcq, { kind: 'flashcard', selfReport: 'known' })).toThrow(
      AnswerKindMismatchError,
    );
  });

  it('reports the correct answer so feedback can explain a miss', () => {
    const mcq = exercises.find((exercise) => exercise.kind === 'multipleChoice')!;
    const result = evaluateAnswer(mcq, { kind: 'multipleChoice', optionId: 'opt-map' });

    expect(result.correct).toBe(false);
    expect(result.correctAnswerSummary).toBe('Devlet işlerinin görüşülüp karara bağlanması');
  });

  it('requires fill-blank tokens in the right order', () => {
    const blank = exercises.find((exercise) => exercise.kind === 'fillBlank')!;
    const reversed = [...blank.solutionTokenIds].reverse();

    expect(evaluateAnswer(blank, { kind: 'fillBlank', tokenIds: reversed }).correct).toBe(false);
    expect(
      evaluateAnswer(blank, { kind: 'fillBlank', tokenIds: [...blank.solutionTokenIds] }).correct,
    ).toBe(true);
  });

  it('requires every matching pair to be right', () => {
    const matching = exercises.find((exercise) => exercise.kind === 'matching')!;
    const allButOne = Object.fromEntries(
      matching.pairs.slice(1).map((pair) => [pair.id, pair.right]),
    );

    expect(evaluateAnswer(matching, { kind: 'matching', pairs: allButOne }).correct).toBe(false);
  });
});
