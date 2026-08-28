import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import {
  LessonSessionProvider,
  useLessonSession,
} from '@/modules/learning/application/lesson-session-store';
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

function SessionHarness() {
  const store = useLessonSession();
  const exerciseId = store.lesson?.session.exerciseIds[store.lesson.session.currentIndex];

  return (
    <View>
      <Text testID="session-state">
        {store.lesson === null
          ? 'none'
          : `${store.lesson.session.status}:${store.lesson.session.currentIndex}`}
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
      {exerciseId === 'exercise.history.time.003.mcq01' ? (
        <Text
          onPress={() =>
            store.submitAnswer({ kind: 'multipleChoice', optionId: 'opt-hicret' })
          }
          testID="answer-first"
        >
          İlk yanıt
        </Text>
      ) : null}
      {exerciseId === 'exercise.history.time.003.tf01' ? (
        <Text
          onPress={() => store.submitAnswer({ choice: true, kind: 'trueFalse' })}
          testID="answer-second"
        >
          İkinci yanıt
        </Text>
      ) : null}
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

    await fireEvent.press(screen.getByTestId('answer-first'));
    await fireEvent.press(screen.getByTestId('continue-session'));
    await waitFor(() => expect(screen.getByTestId('answer-second')).toBeTruthy());
    await fireEvent.press(screen.getByTestId('answer-second'));
    await fireEvent.press(screen.getByTestId('continue-session'));

    await waitFor(() => expect(screen.getByTestId('persistence-state')).toHaveTextContent('saved'));
    const completed = await repositories.sessions.completionCounts();
    expect(completed.lessons).toBe(1);
    await expect(repositories.xp.total()).resolves.toBe(65);
  });
});
