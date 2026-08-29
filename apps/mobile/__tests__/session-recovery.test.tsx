import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import {
  isScoredKind,
  type ExerciseDefinition,
} from '@/modules/curriculum/domain/content-types';
import type { ExerciseAnswer } from '@/modules/learning/domain/answers';
import {
  LessonSessionProvider,
  useLessonSession,
} from '@/modules/learning/application/lesson-session-store';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';
import { migrateToLatest } from '@/modules/progress/infrastructure/migrations';
import { createSqliteRepositories } from '@/modules/progress/infrastructure/sqlite-repositories';
import type { Clock } from '@/shared/time/clock';

import { createTestDatabase } from './support/node-sqlite-database';

let tick = 0;
const isoClock = () => `2026-08-28T10:00:${String(++tick).padStart(2, '0')}.000Z`;
const progressClock: Clock = {
  now: () => Date.parse('2026-08-28T10:10:00.000Z'),
  timeZone: () => 'Europe/Istanbul',
};

/**
 * A correct answer for whatever is on screen. The recovery test is about the
 * snapshot surviving a relaunch, not about how long a lesson happens to be, so
 * it must not encode either.
 */
function correctAnswerFor(exercise: ExerciseDefinition): ExerciseAnswer {
  switch (exercise.kind) {
    case 'multipleChoice':
      return { kind: 'multipleChoice', optionId: exercise.correctOptionId };
    case 'trueFalse':
      return { choice: exercise.correctAnswer, kind: 'trueFalse' };
    case 'fillBlank':
      return { kind: 'fillBlank', tokenIds: exercise.solutionTokenIds };
    case 'matching':
      return {
        kind: 'matching',
        pairs: Object.fromEntries(exercise.pairs.map((pair) => [pair.id, pair.right])),
      };
    case 'ordering':
      return { itemIds: exercise.correctOrder, kind: 'ordering' };
    case 'flashcard':
      return { kind: 'flashcard', selfReport: 'known' };
  }
}

function SessionHarness() {
  const store = useLessonSession();
  const session = store.lesson?.session ?? null;
  const exercise =
    session === null ? undefined : store.lesson?.deps.exercises[session.currentIndex];

  return (
    <View>
      <Text testID="session-state">
        {session === null ? 'none' : `${session.status}:${session.currentIndex}`}
      </Text>
      <Text testID="persistence-state">{store.persistenceStatus}</Text>
      <Text
        onPress={() =>
          store.begin('lesson.history.time.003', 'path.history.time.03')
        }
        testID="start-session"
      >
        Başla
      </Text>
      {exercise === undefined ? null : (
        <Text
          onPress={() => store.submitAnswer(correctAnswerFor(exercise))}
          testID="answer-current"
        >
          Yanıtla
        </Text>
      )}
      <Text onPress={store.continueAfterFeedback} testID="continue-session">
        Devam
      </Text>
    </View>
  );
}

describe('durable session recovery', () => {
  it('starts, exits by unmounting, resumes the same snapshot, and completes once', async () => {
    tick = 0;
    const db = createTestDatabase();
    await migrateToLatest(db);
    const repositories = createSqliteRepositories(db);

    const first = await render(
      <LessonSessionProvider
        clock={isoClock}
        progressClock={progressClock}
        repositories={repositories}
      >
        <SessionHarness />
      </LessonSessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('start-session')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('start-session'));
    await waitFor(async () =>
      expect(await repositories.sessions.findActive()).toMatchObject({
        currentExerciseIndex: 0,
        lessonId: 'lesson.history.time.003',
      }),
    );
    await first.rerender(
      <LessonSessionProvider
        clock={isoClock}
        key="relaunch"
        progressClock={progressClock}
        repositories={repositories}
      >
        <SessionHarness />
      </LessonSessionProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('session-state')).toHaveTextContent('active:0'));

    const scoredCount = getContentIndex()
      .getLessonExercises('lesson.history.time.003')
      .filter((exercise) => isScoredKind(exercise.kind)).length;

    for (let answered = 0; answered < scoredCount; answered += 1) {
      await fireEvent.press(screen.getByTestId('answer-current'));
      await fireEvent.press(screen.getByTestId('continue-session'));
    }

    await waitFor(() => expect(screen.getByTestId('persistence-state')).toHaveTextContent('saved'));
    const completed = await repositories.sessions.completionCounts();
    expect(completed.lessons).toBe(1);
    await expect(repositories.xp.total()).resolves.toBe(
      scoredCount * XP_POLICY_V1.correctExercise +
        XP_POLICY_V1.lessonCompletion +
        XP_POLICY_V1.firstPathLevelCompletion,
    );
  });
});
