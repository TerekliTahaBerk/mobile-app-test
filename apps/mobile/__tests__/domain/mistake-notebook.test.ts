import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import type { ExerciseId, LessonId } from '@/modules/curriculum/domain/content-types';
import { buildMistakeNotebook } from '@/modules/progress/domain/mistake-notebook';
import type { Mistake, StoredAttempt } from '@/modules/progress/domain/progress-types';

const index = createContentIndex(tytDraftBundle);
const EXERCISE = 'exercise.history.states.001.mcq01';
const skillId = index.getExercise(EXERCISE as ExerciseId).skillIds[0]!;

function mistake(overrides: Partial<Mistake> = {}): Mistake {
  return {
    createdAt: '2026-08-20T09:00:00.000Z',
    id: 'mistake:session-1:skill',
    skillId,
    sourceExerciseId: EXERCISE as ExerciseId,
    sourceLessonId: 'lesson.history.states.001' as LessonId,
    status: 'unresolved',
    ...overrides,
  };
}

function attempt(
  id: string,
  correct: boolean,
  answer: string,
  occurredAt = '2026-08-20T09:00:00.000Z',
): StoredAttempt {
  return {
    answer,
    attemptNumber: 1,
    correct,
    exerciseId: EXERCISE as ExerciseId,
    id,
    lessonId: 'lesson.history.states.001' as LessonId,
    occurredAt,
    scored: true,
    sessionId: 'session-1',
  };
}

/** A wrong option id for the source question, whatever the bundle authored. */
function wrongOptionId(): string {
  const exercise = index.getExercise(EXERCISE as ExerciseId);
  if (exercise.kind !== 'multipleChoice') {
    throw new Error('Bu test çoktan seçmeli bir kaynak soru bekliyor.');
  }

  return exercise.options.find((option) => option.id !== exercise.correctOptionId)!.id;
}

describe('mistake notebook', () => {
  it('shows the question, the answer given, the right answer, and why', () => {
    const chosen = wrongOptionId();
    const notebook = buildMistakeNotebook(
      [mistake()],
      [attempt('a1', false, JSON.stringify({ kind: 'multipleChoice', optionId: chosen }))],
      index,
    );
    const exercise = index.getExercise(EXERCISE as ExerciseId);
    const entry = notebook.entries[0]!;

    expect(entry.prompt).toBe(exercise.kind === 'multipleChoice' ? exercise.prompt : '');
    expect(entry.givenAnswer).toBe(
      exercise.kind === 'multipleChoice'
        ? exercise.options.find((option) => option.id === chosen)?.label
        : null,
    );
    expect(entry.correctAnswer).not.toBe(entry.givenAnswer);
    expect(entry.explanation).toBe(exercise.explanation);
    expect(entry.mainTopicTitle).not.toBe('');
    expect(entry.subtopicTitle).not.toBe('');
  });

  it('counts how many times the question has been missed', () => {
    const answer = JSON.stringify({ kind: 'multipleChoice', optionId: wrongOptionId() });
    const notebook = buildMistakeNotebook(
      [mistake()],
      [
        attempt('a1', false, answer, '2026-08-20T09:00:00.000Z'),
        attempt('a2', false, answer, '2026-08-24T09:00:00.000Z'),
        attempt('a3', true, '{"kind":"multipleChoice","optionId":"x"}', '2026-08-26T09:00:00.000Z'),
      ],
      index,
    );

    expect(notebook.entries[0]).toMatchObject({
      lastSeenAt: '2026-08-26T09:00:00.000Z',
      wrongCount: 2,
    });
  });

  it('reports a resolved record as learned rather than deleting it', () => {
    const notebook = buildMistakeNotebook(
      [mistake({ resolvedAt: '2026-08-27T09:00:00.000Z', status: 'resolved' })],
      [],
      index,
    );

    expect(notebook.entries[0]).toMatchObject({
      resolvedAt: '2026-08-27T09:00:00.000Z',
      status: 'learned',
    });
    expect(notebook).toMatchObject({ learnedCount: 1, openCount: 0 });
  });

  it('puts open mistakes first, most-missed first', () => {
    const answer = JSON.stringify({ kind: 'multipleChoice', optionId: wrongOptionId() });
    const notebook = buildMistakeNotebook(
      [
        mistake({ id: 'learned', resolvedAt: '2026-08-27T09:00:00.000Z', status: 'resolved' }),
        mistake({ id: 'open' }),
      ],
      [attempt('a1', false, answer), attempt('a2', false, answer)],
      index,
    );

    expect(notebook.entries.map((entry) => entry.id)).toEqual(['open', 'learned']);
    expect(notebook.entries[0]?.wrongCount).toBe(2);
  });

  it('survives an answer it can no longer read', () => {
    const notebook = buildMistakeNotebook([mistake()], [attempt('a1', false, 'not json')], index);

    expect(notebook.entries[0]?.givenAnswer).toBeNull();
    expect(notebook.entries[0]?.correctAnswer).not.toBe('');
  });

  it('omits a record whose question has left the content bundle', () => {
    const notebook = buildMistakeNotebook(
      [mistake({ sourceExerciseId: 'exercise.removed' as ExerciseId })],
      [],
      index,
    );

    expect(notebook.entries).toEqual([]);
  });
});
