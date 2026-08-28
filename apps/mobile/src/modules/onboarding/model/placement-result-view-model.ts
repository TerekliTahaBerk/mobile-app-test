import type { DailyPlanCard } from '@/modules/learning/model/daily-plan-card';
import type { TopicPerformanceBand } from '@/modules/progress/domain/topic-performance';

export type PlacementTopicRow = {
  accuracyLabel: string;
  band: TopicPerformanceBand;
  id: string;
  mainTopicTitle: string;
  statusLabel: string;
  title: string;
};

export type PlacementResultViewModel = {
  /** "18 sorudan 11 doğru · 5 alt konu ölçüldü" */
  detail: string;
  /** Null while nothing could be planned from the result. */
  plan: DailyPlanCard | null;
  /** Every subtopic the diagnostic could speak about, weakest first. */
  rows: readonly PlacementTopicRow[];
};
