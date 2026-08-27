import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type { LessonId, PathNodeId } from '@/modules/curriculum/domain/content-types';
import type { ExerciseAnswer } from '@/modules/learning/domain/answers';
import type { DomainEvent } from '@/modules/learning/domain/events';
import {
  createLessonSession,
  reduceLessonSession,
  summarizeLessonSession,
  type LessonEngineDeps,
  type LessonSession,
  type LessonSummary,
} from '@/modules/learning/domain/lesson-session';

/**
 * The bridge between the pure lesson engine and React.
 *
 * This is the only place that owns a live session. It holds the engine's state
 * in memory for the length of the flow — lesson intro, exercises, completion —
 * so the completion screen can report what actually happened rather than a
 * fixture. Nothing is written to disk; a restart loses the session, which is
 * expected until Milestone 6.
 *
 * The engine itself stays pure: this file supplies the clock and keeps the
 * reducer's output, and never reimplements a rule.
 */

export type ActiveLesson = {
  deps: LessonEngineDeps;
  session: LessonSession;
};

type LessonSessionStore = {
  /** Events emitted so far, oldest first. Nothing consumes them yet. */
  readonly events: readonly DomainEvent[];
  readonly lesson: ActiveLesson | null;
  abandon: () => void;
  begin: (lessonId: LessonId, pathNodeId?: PathNodeId) => void;
  continueAfterFeedback: () => void;
  discard: () => void;
  submitAnswer: (answer: ExerciseAnswer) => void;
  readonly summary: LessonSummary | null;
};

const LessonSessionContext = createContext<LessonSessionStore | null>(null);

/** Injectable so tests can drive the engine on a fixed clock. */
export type Clock = () => string;

const systemClock: Clock = () => new Date().toISOString();

type LessonSessionProviderProps = {
  children: ReactNode;
  clock?: Clock;
};

export function LessonSessionProvider({ children, clock = systemClock }: LessonSessionProviderProps) {
  const [lesson, setLesson] = useState<ActiveLesson | null>(null);
  const [events, setEvents] = useState<readonly DomainEvent[]>([]);

  const dispatch = useCallback(
    (command: Parameters<typeof reduceLessonSession>[1]) => {
      setLesson((current) => {
        if (current === null) {
          return current;
        }

        const result = reduceLessonSession(current.session, command, current.deps);
        setEvents((previous) => [...previous, ...result.events]);

        return { ...current, session: result.session };
      });
    },
    [],
  );

  const begin = useCallback(
    (lessonId: LessonId, pathNodeId?: PathNodeId) => {
      const index = getContentIndex();
      const deps: LessonEngineDeps = {
        exercises: index.getLessonExercises(lessonId),
        lesson: index.getLesson(lessonId),
        ...(pathNodeId === undefined ? {} : { pathNodeId }),
      };
      const started = reduceLessonSession(
        createLessonSession(deps),
        { at: clock(), type: 'startLesson' },
        deps,
      );

      setEvents(started.events);
      setLesson({ deps, session: started.session });
    },
    [clock],
  );

  const value = useMemo<LessonSessionStore>(
    () => ({
      abandon: () => dispatch({ at: clock(), type: 'abandonLesson' }),
      begin,
      continueAfterFeedback: () => dispatch({ at: clock(), type: 'continueAfterFeedback' }),
      discard: () => {
        setLesson(null);
        setEvents([]);
      },
      events,
      lesson,
      submitAnswer: (answer) => dispatch({ answer, at: clock(), type: 'submitAnswer' }),
      summary: lesson === null ? null : summarizeLessonSession(lesson.session),
    }),
    [begin, clock, dispatch, events, lesson],
  );

  return <LessonSessionContext.Provider value={value}>{children}</LessonSessionContext.Provider>;
}

export function useLessonSession(): LessonSessionStore {
  const store = useContext(LessonSessionContext);
  if (store === null) {
    throw new Error('useLessonSession, LessonSessionProvider içinde çağrılmalı.');
  }

  return store;
}
