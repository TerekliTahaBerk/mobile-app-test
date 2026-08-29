import { buildDailyPlanCard } from '@/modules/learning/model/daily-plan-card';
import type {
  PlacementResultViewModel,
  PlacementTopicRow,
} from '@/modules/onboarding/model/placement-result-view-model';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import type { TopicPerformanceBand } from '@/modules/progress/domain/topic-performance';

const BAND_ORDER: Readonly<Record<TopicPerformanceBand, number>> = {
  developing: 1,
  needsPractice: 0,
  strong: 2,
};

/**
 * The starting map. It is the ordinary topic report read straight after the
 * diagnostic — the first evidence rather than a separate kind of result — so
 * nothing here can claim more than the learner's own answers support.
 */
export function buildPlacementResultViewModel(
  dashboard: Pick<ProgressDashboard, 'dailyPlan' | 'topicPerformance'>,
): PlacementResultViewModel {
  const topics = dashboard.topicPerformance.topics;
  const rows: PlacementTopicRow[] = topics
    .flatMap((topic) =>
      topic.subtopics.map((subtopic) => ({
        accuracy: subtopic.accuracy,
        accuracyLabel: `%${Math.round(subtopic.accuracy * 100)}`,
        band: subtopic.band,
        id: subtopic.id,
        mainTopicTitle: topic.title,
        statusLabel: bandLabel(subtopic.band),
        title: subtopic.title,
      })),
    )
    // "En çok çalışman gereken konudan başlar": the band decides the group, and
    // inside a group the lower score comes first.
    .sort(
      (left, right) =>
        BAND_ORDER[left.band] - BAND_ORDER[right.band] ||
        left.accuracy - right.accuracy ||
        left.title.localeCompare(right.title, 'tr'),
    )
    .map(({ accuracy: _accuracy, ...row }) => row);

  const answered = topics.reduce((sum, topic) => sum + topic.totalAttempts, 0);
  const correct = topics.reduce((sum, topic) => sum + topic.correctAnswers, 0);

  return {
    detail: `${answered} sorudan ${correct} doğru · ${rows.length} alt konu ölçüldü`,
    plan: buildDailyPlanCard(dashboard.dailyPlan),
    rows,
  };
}

function bandLabel(band: TopicPerformanceBand): string {
  switch (band) {
    case 'strong':
      return 'Güçlü';
    case 'needsPractice':
      return 'Tekrar gerekli';
    case 'developing':
      return 'Gelişiyor';
  }
}
