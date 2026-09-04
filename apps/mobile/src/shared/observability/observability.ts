import type { AppMode } from '@/shared/config/app-config';

/** Privacy-conscious product events. Payloads contain stable content IDs only. */
export type AnalyticsEventMap = {
  onboarding_started: Record<string, never>;
  onboarding_completed: { exam: 'yks' };
  lesson_started: { lessonId: string; pathNodeId?: string; sessionKind: 'lesson' | 'review' };
  lesson_resumed: { lessonId: string; sessionId: string; sessionKind: 'lesson' | 'review' };
  exercise_answered: {
    attemptNumber: number;
    correct: boolean;
    exerciseId: string;
    lessonId: string;
    sessionKind: 'lesson' | 'review';
  };
  daily_plan_started: { partCount: number; questionCount: number; topicCount: number };
  lesson_completed: {
    correctCount: number;
    lessonId: string;
    scoredCount: number;
    sessionKind: 'lesson' | 'review';
  };
  placement_started: { questionCount: number; topicCount: number };
  path_node_unlocked: { pathNodeId: string; prerequisiteId: string };
  question_reported: { exerciseId: string; reason: string };
  reminders_scheduled: { count: number };
  review_started: { lessonId: string; skillId: string };
  review_completed: { correctCount: number; lessonId: string; scoredCount: number };
  topic_practice_started: { lessonId: string; questionCount: number; topicId: string };
};

export type ErrorContext = {
  componentStack?: string | null | undefined;
  operation?: string | undefined;
};

export type DiagnosticSnapshot = {
  appMode: AppMode;
  contentVersion: string;
  environment: string;
  release: string;
  schemaVersion: number;
};

export type ObservabilityAdapter = {
  captureEvent: <TName extends keyof AnalyticsEventMap>(
    name: TName,
    payload: AnalyticsEventMap[TName],
  ) => void;
  captureException: (error: Error, context: ErrorContext) => void;
  recordDiagnostics: (snapshot: DiagnosticSnapshot) => void;
};

const noopAdapter: ObservabilityAdapter = {
  captureEvent: () => undefined,
  captureException: () => undefined,
  recordDiagnostics: () => undefined,
};

let adapter: ObservabilityAdapter = noopAdapter;

export function trackEvent<TName extends keyof AnalyticsEventMap>(
  name: TName,
  payload: AnalyticsEventMap[TName],
): void {
  safely(() => adapter.captureEvent(name, payload));
}

export function reportError(error: Error, context: ErrorContext = {}): void {
  safely(() => adapter.captureException(error, context));
}

export function recordDiagnostics(snapshot: DiagnosticSnapshot): void {
  safely(() => adapter.recordDiagnostics(snapshot));
}

/** Composition/test seam. The production bootstrap installs the Sentry adapter. */
export function setObservabilityAdapter(next: ObservabilityAdapter | null): void {
  adapter = next ?? noopAdapter;
}

/** Telemetry is intentionally non-critical and can never break studying. */
function safely(operation: () => void): void {
  try {
    operation();
  } catch (cause) {
    if (__DEV__) {
      console.warn('[Tekrarla] Gözlemlenebilirlik adaptörü başarısız:', cause);
    }
  }
}
