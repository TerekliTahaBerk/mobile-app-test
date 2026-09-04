import type {
  SessionContext,
  SessionPurpose,
} from '@/modules/progress/domain/progress-types';

export type LessonCompletionParams =
  | Record<string, never>
  | { returnTo: 'placement' }
  | {
      beforeAccuracy: string;
      returnTo: 'topicPerformance';
      topicId: string;
    };

/** Builds the completion destination solely from durable session intent. */
export function lessonCompletionParams(active: {
  context: SessionContext;
  purpose: SessionPurpose;
}): LessonCompletionParams {
  if (active.purpose === 'placement') {
    return { returnTo: 'placement' };
  }

  if (active.purpose === 'topicPractice' && 'topicId' in active.context) {
    return {
      beforeAccuracy: String(active.context.beforeAccuracy),
      returnTo: 'topicPerformance',
      topicId: active.context.topicId,
    };
  }

  return {};
}
