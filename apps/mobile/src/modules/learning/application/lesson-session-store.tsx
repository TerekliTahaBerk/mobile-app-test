import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type {
  ExerciseId,
  LessonId,
  PathNodeId,
  SkillId,
  TopicId,
} from '@/modules/curriculum/domain/content-types';
import { isScoredKind } from '@/modules/curriculum/domain/content-types';
import type { ExerciseAnswer } from '@/modules/learning/domain/answers';
import type { DailyPlan } from '@/modules/learning/domain/daily-plan';
import { assemblePlacement } from '@/modules/learning/domain/placement';
import type { DomainEvent } from '@/modules/learning/domain/events';
import {
  createLessonSession,
  reduceLessonSession,
  summarizeLessonSession,
  type LessonEngineDeps,
  type LessonSession,
  type LessonSummary,
} from '@/modules/learning/domain/lesson-session';
import { XP_POLICY_V1 } from '@/modules/learning/domain/xp-policy';
import { assembleTargetedPractice } from '@/modules/learning/domain/targeted-practice';
import {
  createLessonPersistence,
  restoreSession,
  sessionIdFor,
  type LessonPersistence,
} from '@/modules/progress/application/lesson-persistence';
import type {
  ProgressRepositories,
  SessionCompletionResult,
} from '@/modules/progress/application/repositories';
import type {
  ReportReason,
  SessionContext,
  SessionKind,
  SessionPurpose,
  StoredSession,
} from '@/modules/progress/domain/progress-types';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';
import { trackEvent } from '@/shared/observability/observability';
import { systemClock, type Clock as ProgressClock } from '@/shared/time/clock';

/** The bridge between the pure lesson engine, React, and durable storage. */
export type ActiveLesson = {
  context: SessionContext;
  deps: LessonEngineDeps;
  kind: SessionKind;
  purpose: SessionPurpose;
  session: LessonSession;
};

export type PersistenceStatus = 'failed' | 'idle' | 'saved' | 'saving';

type LessonSessionStore = {
  readonly completionResult: SessionCompletionResult | null;
  readonly events: readonly DomainEvent[];
  readonly lesson: ActiveLesson | null;
  readonly persistenceError: Error | null;
  readonly persistenceStatus: PersistenceStatus;
  abandon: () => void;
  begin: (lessonId: LessonId, pathNodeId?: PathNodeId) => void;
  beginDailyPlan: (plan: DailyPlan) => void;
  beginPlacement: () => Promise<number>;
  beginReview: (skillId: SkillId) => void;
  beginTopicPractice: (topicId: TopicId, beforeAccuracy: number) => Promise<number>;
  continueAfterFeedback: () => void;
  discard: () => void;
  reportQuestion: (exerciseId: ExerciseId, reason: ReportReason) => Promise<void>;
  retryPersistence: () => void;
  resume: (sessionId: string) => Promise<boolean>;
  submitAnswer: (answer: ExerciseAnswer) => void;
  readonly summary: LessonSummary | null;
};

const LessonSessionContext = createContext<LessonSessionStore | null>(null);

/** Legacy/test-friendly ISO clock used by existing UI tests. */
export type Clock = () => string;
const systemIsoClock: Clock = () => new Date().toISOString();

type LessonSessionProviderProps = {
  children: ReactNode;
  clock?: Clock;
  progressClock?: ProgressClock;
  /** Omitted in pure UI tests; production always supplies SQLite repositories. */
  repositories?: ProgressRepositories;
};

const REVIEW_XP_POLICY = {
  ...XP_POLICY_V1,
  firstPathLevelCompletion: 0,
  lessonCompletion: 0,
} as const;

export function LessonSessionProvider({
  children,
  clock = systemIsoClock,
  progressClock = systemClock,
  repositories,
}: LessonSessionProviderProps) {
  const [lesson, setLesson] = useState<ActiveLesson | null>(null);
  const lessonRef = useRef<ActiveLesson | null>(null);
  const [events, setEvents] = useState<readonly DomainEvent[]>([]);
  const [hydrated, setHydrated] = useState(repositories === undefined);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('idle');
  const [persistenceError, setPersistenceError] = useState<Error | null>(null);
  const [completionResult, setCompletionResult] = useState<SessionCompletionResult | null>(null);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const persistence = useMemo<LessonPersistence | null>(
    () =>
      repositories === undefined
        ? null
        : createLessonPersistence(repositories, progressClock),
    [progressClock, repositories],
  );

  const installLesson = useCallback((next: ActiveLesson | null) => {
    lessonRef.current = next;
    setLesson(next);
  }, []);

  useEffect(() => {
    if (repositories === undefined) {
      return;
    }

    let cancelled = false;
    repositories.sessions
      .findActive()
      .then(async (stored) => {
        if (cancelled || stored === null) {
          return;
        }

        const restored = restoreSession(stored);
        if (restored === null) {
          await repositories.sessions.markStale(
            stored.sessionId,
            new Date(progressClock.now()).toISOString(),
          );
          return;
        }

        if (!cancelled) {
          installLesson({
            context: stored.context,
            deps: depsForStoredSession(stored, restored),
            kind: stored.kind,
            purpose: stored.purpose,
            session: restored,
          });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setPersistenceError(asError(cause));
          setPersistenceStatus('failed');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [installLesson, progressClock, repositories]);

  const enqueuePersistence = useCallback(
    (active: ActiveLesson) => {
      if (persistence === null) {
        return;
      }

      if (active.session.status === 'completed') {
        // Set this before the queued write starts so navigation cannot observe
        // a completed domain session while SQLite is still pending.
        setPersistenceStatus('saving');
      }

      const run = async () => {
        setPersistenceError(null);
        if (active.session.status === 'completed') {
          const result = await persistence.complete(
            active.session,
            active.kind,
            active.purpose,
            active.context,
          );
          setCompletionResult(result);
          if (result.firstCompletionAwarded && active.session.pathNodeId !== undefined) {
            const completed = new Set(
              (await repositories?.progress.getAll())
                ?.filter((row) => row.status === 'completed')
                .map((row) => row.pathNodeId) ?? [],
            );
            for (const node of getContentIndex().bundle.pathNodes) {
              if (
                node.prerequisiteIds.includes(active.session.pathNodeId) &&
                node.prerequisiteIds.every((id) => completed.has(id))
              ) {
                trackEvent('path_node_unlocked', {
                  pathNodeId: node.id,
                  prerequisiteId: active.session.pathNodeId,
                });
              }
            }
          }
          setPersistenceStatus('saved');
          return;
        }

        await persistence.saveProgress(
          active.session,
          active.kind,
          active.purpose,
          active.context,
        );
        setPersistenceStatus('idle');
      };

      const operation = writeQueue.current.then(run);
      writeQueue.current = operation.catch((cause: unknown) => {
        setPersistenceError(asError(cause));
        setPersistenceStatus('failed');
      });
    },
    [persistence, repositories],
  );

  const dispatch = useCallback(
    (command: Parameters<typeof reduceLessonSession>[1]) => {
      const current = lessonRef.current;
      if (current === null) {
        return;
      }

      const result = reduceLessonSession(current.session, command, current.deps);
      const next = { ...current, session: result.session };
      setEvents((previous) => [...previous, ...result.events]);
      installLesson(next);
      trackDomainEvents(result.events, current);
      enqueuePersistence(next);
    },
    [enqueuePersistence, installLesson],
  );

  const begin = useCallback(
    (lessonId: LessonId, pathNodeId?: PathNodeId) => {
      const index = getContentIndex();
      const deps: LessonEngineDeps = {
        exercises: index.getLessonExercises(lessonId),
        lesson: index.getLesson(lessonId),
        ...(pathNodeId === undefined ? {} : { pathNodeId }),
      };
      start(deps, 'lesson', 'lesson', {}, clock, installLesson, setEvents, enqueuePersistence);
      setCompletionResult(null);
    },
    [clock, enqueuePersistence, installLesson],
  );

  /**
   * Opens today's plan as one mixed drill. It deliberately carries no path
   * node: a plan that crosses several units is practice, and completing it must
   * not mark curriculum as finished.
   */
  const beginDailyPlan = useCallback(
    (plan: DailyPlan) => {
      if (plan.exercises.length === 0) {
        throw new Error('Bugün için plan oluşturulacak soru bulunamadı.');
      }

      const index = getContentIndex();
      const sourceLesson = index.bundle.lessons.find((candidate) =>
        candidate.exerciseIds.includes(plan.exercises[0]!.id),
      );
      if (sourceLesson === undefined) {
        throw new Error(`Plan sorusunun dersi bulunamadı: "${plan.exercises[0]!.id}".`);
      }

      const deps: LessonEngineDeps = {
        exercises: plan.exercises,
        lesson: {
          ...sourceLesson,
          exerciseIds: plan.exercises.map((exercise) => exercise.id),
          subtitle: 'Bugünün planı',
          title: 'Günün Çalışması',
        },
        xpPolicy: REVIEW_XP_POLICY,
      };
      start(deps, 'review', 'dailyPlan', {}, clock, installLesson, setEvents, enqueuePersistence);
      trackEvent('daily_plan_started', {
        partCount: plan.parts.length,
        questionCount: plan.exercises.length,
        topicCount: plan.topicCount,
      });
      setCompletionResult(null);
    },
    [clock, enqueuePersistence, installLesson],
  );

  /**
   * Opens the starting diagnostic. Like the daily plan it carries no path node:
   * measuring what a learner knows must not mark curriculum as completed, so
   * the path stays exactly where their own work left it.
   */
  const beginPlacement = useCallback(async () => {
    const reports = (await repositories?.reports.listAll()) ?? [];
    const index = getContentIndex();
    const placement = assemblePlacement(
      index,
      new Set(reports.map((report) => report.exerciseId)),
    );
    const sourceLesson = index.bundle.lessons.find((candidate) =>
      candidate.exerciseIds.includes(placement.exercises[0]!.id),
    );
    if (sourceLesson === undefined) {
      throw new Error(`Tespit sorusunun dersi bulunamadı: "${placement.exercises[0]!.id}".`);
    }

    const deps: LessonEngineDeps = {
      exercises: placement.exercises,
      lesson: {
        ...sourceLesson,
        exerciseIds: placement.exercises.map((exercise) => exercise.id),
        subtitle: 'Başlangıç seviyesi',
        title: 'Seviye Tespiti',
      },
      xpPolicy: REVIEW_XP_POLICY,
    };
    start(deps, 'review', 'placement', {}, clock, installLesson, setEvents, enqueuePersistence);
    trackEvent('placement_started', {
      questionCount: placement.exercises.length,
      topicCount: placement.topicIds.length,
    });
    setCompletionResult(null);

    return placement.exercises.length;
  }, [clock, enqueuePersistence, installLesson, repositories]);

  const beginReview = useCallback(
    (skillId: SkillId) => {
      const index = getContentIndex();
      const exercises = index.bundle.exercises
        .filter((exercise) => isScoredKind(exercise.kind) && exercise.skillIds.includes(skillId))
        .sort((a, b) => a.id.localeCompare(b.id))
        .slice(0, 3);

      if (exercises.length === 0) {
        throw new Error(`Tekrar için alıştırma bulunamadı: "${skillId}".`);
      }

      const lesson = index.bundle.lessons.find((candidate) =>
        candidate.exerciseIds.includes(exercises[0]!.id),
      );
      if (lesson === undefined) {
        throw new Error(`Tekrar alıştırmasının dersi bulunamadı: "${exercises[0]!.id}".`);
      }

      const deps: LessonEngineDeps = { exercises, lesson, xpPolicy: REVIEW_XP_POLICY };
      start(deps, 'review', 'review', {}, clock, installLesson, setEvents, enqueuePersistence);
      trackEvent('review_started', { lessonId: lesson.id, skillId });
      setCompletionResult(null);
    },
    [clock, enqueuePersistence, installLesson],
  );

  const beginTopicPractice = useCallback(
    async (topicId: TopicId, beforeAccuracy: number) => {
      const attempts = (await repositories?.attempts.listAllScored()) ?? [];
      const reports = (await repositories?.reports.listAll()) ?? [];
      const practice = assembleTargetedPractice(
        topicId,
        getContentIndex(),
        5,
        attempts,
        new Set(reports.map((report) => report.exerciseId)),
      );
      const deps: LessonEngineDeps = {
        exercises: practice.exercises,
        lesson: practice.lesson,
        xpPolicy: REVIEW_XP_POLICY,
      };
      start(
        deps,
        'review',
        'topicPractice',
        { beforeAccuracy, topicId },
        clock,
        installLesson,
        setEvents,
        enqueuePersistence,
      );
      trackEvent('topic_practice_started', {
        lessonId: practice.lesson.id,
        questionCount: practice.exercises.length,
        topicId,
      });
      setCompletionResult(null);
      return practice.exercises.length;
    },
    [clock, enqueuePersistence, installLesson, repositories],
  );

  /**
   * Records that the learner considers this question broken. It is deliberately
   * not part of the answer: reporting is not answering, and it neither scores
   * nor advances the round.
   */
  const reportQuestion = useCallback(
    async (exerciseId: ExerciseId, reason: ReportReason) => {
      const current = lessonRef.current;
      if (repositories === undefined || current === null) {
        return;
      }
      const sessionId = sessionIdFor(current.session);
      await repositories.reports.record({
        createdAt: new Date(progressClock.now()).toISOString(),
        exerciseId,
        // One report per question per round, so a changed mind corrects the
        // reason rather than adding a second row.
        id: `report:${sessionId}:${exerciseId}`,
        reason,
        sessionId,
      });
      trackEvent('question_reported', { exerciseId, reason });
    },
    [progressClock, repositories],
  );

  const retryPersistence = useCallback(() => {
    const current = lessonRef.current;
    if (current !== null) {
      setPersistenceStatus(current.session.status === 'completed' ? 'saving' : 'idle');
      enqueuePersistence(current);
    }
  }, [enqueuePersistence]);

  const resume = useCallback(
    async (sessionId: string) => {
      if (repositories === undefined) {
        return lessonRef.current !== null;
      }

      const stored = await repositories.sessions.get(sessionId);
      if (stored === null || stored.status !== 'active') {
        return false;
      }

      const restored = restoreSession(stored);
      if (restored === null) {
        await repositories.sessions.markStale(
          sessionId,
          new Date(progressClock.now()).toISOString(),
        );
        return false;
      }

      installLesson({
        context: stored.context,
        deps: depsForStoredSession(stored, restored),
        kind: stored.kind,
        purpose: stored.purpose,
        session: restored,
      });
      setEvents([]);
      setCompletionResult(null);
      setPersistenceError(null);
      setPersistenceStatus('idle');
      trackEvent('lesson_resumed', {
        lessonId: stored.lessonId,
        sessionId,
        sessionKind: stored.kind,
      });
      return true;
    },
    [installLesson, progressClock, repositories],
  );

  const value = useMemo<LessonSessionStore>(
    () => ({
      abandon: () => dispatch({ at: clock(), type: 'abandonLesson' }),
      begin,
      beginDailyPlan,
      beginPlacement,
      beginReview,
      beginTopicPractice,
      completionResult,
      continueAfterFeedback: () => dispatch({ at: clock(), type: 'continueAfterFeedback' }),
      discard: () => {
        installLesson(null);
        setEvents([]);
        setCompletionResult(null);
        setPersistenceError(null);
        setPersistenceStatus('idle');
      },
      events,
      lesson,
      persistenceError,
      persistenceStatus,
      reportQuestion,
      retryPersistence,
      resume,
      submitAnswer: (answer) => dispatch({ answer, at: clock(), type: 'submitAnswer' }),
      summary: lesson === null ? null : summarizeLessonSession(lesson.session),
    }),
    [
      begin,
      beginDailyPlan,
      beginPlacement,
      beginReview,
      beginTopicPractice,
      clock,
      completionResult,
      dispatch,
      events,
      installLesson,
      lesson,
      persistenceError,
      persistenceStatus,
      reportQuestion,
      retryPersistence,
      resume,
    ],
  );

  if (!hydrated) {
    return (
      <MessageScreen
        body="Yarım kalan çalışman kontrol ediliyor."
        heading="Hazırlanıyor"
        testID="session-restoring"
        tone="muted"
      />
    );
  }

  return <LessonSessionContext.Provider value={value}>{children}</LessonSessionContext.Provider>;
}

function start(
  deps: LessonEngineDeps,
  kind: SessionKind,
  purpose: SessionPurpose,
  context: SessionContext,
  clock: Clock,
  installLesson: (lesson: ActiveLesson) => void,
  setEvents: (events: readonly DomainEvent[]) => void,
  persist: (lesson: ActiveLesson) => void,
) {
  const result = reduceLessonSession(
    createLessonSession(deps),
    { at: clock(), type: 'startLesson' },
    deps,
  );
  const active = { context, deps, kind, purpose, session: result.session };
  trackEvent('lesson_started', {
    lessonId: deps.lesson.id,
    ...(deps.pathNodeId === undefined ? {} : { pathNodeId: deps.pathNodeId }),
    sessionKind: kind,
  });
  setEvents(result.events);
  installLesson(active);
  persist(active);
}

function trackDomainEvents(events: readonly DomainEvent[], active: ActiveLesson): void {
  for (const event of events) {
    if (event.type === 'AnswerSubmitted') {
      trackEvent('exercise_answered', {
        attemptNumber: event.attemptNumber,
        correct: event.correct,
        exerciseId: event.exerciseId,
        lessonId: active.session.lessonId,
        sessionKind: active.kind,
      });
    }
    if (event.type === 'LessonCompleted') {
      trackEvent('lesson_completed', {
        correctCount: event.correctCount,
        lessonId: event.lessonId,
        scoredCount: event.scoredCount,
        sessionKind: active.kind,
      });
      if (active.kind === 'review') {
        trackEvent('review_completed', {
          correctCount: event.correctCount,
          lessonId: event.lessonId,
          scoredCount: event.scoredCount,
        });
      }
    }
  }
}

function depsForStoredSession(stored: StoredSession, session: LessonSession): LessonEngineDeps {
  const index = getContentIndex();

  return {
    exercises: session.exerciseIds.map((exerciseId) => index.getExercise(exerciseId)),
    lesson: index.getLesson(stored.lessonId),
    ...(stored.pathNodeId === undefined ? {} : { pathNodeId: stored.pathNodeId }),
    ...(stored.kind === 'review' ? { xpPolicy: REVIEW_XP_POLICY } : {}),
  };
}

function asError(cause: unknown): Error {
  return cause instanceof Error ? cause : new Error(String(cause));
}

export function useLessonSession(): LessonSessionStore {
  const store = useContext(LessonSessionContext);
  if (store === null) {
    throw new Error('useLessonSession, LessonSessionProvider içinde çağrılmalı.');
  }

  return store;
}
