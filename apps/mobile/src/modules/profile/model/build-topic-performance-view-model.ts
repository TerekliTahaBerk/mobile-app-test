import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type {
  CorrectedTopicCard,
  MainTopicCard,
  SubtopicCard,
  TopicPerformanceViewModel,
  TopicWindowOption,
} from '@/modules/profile/model/topic-performance-view-model';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import {
  buildTopicPerformance,
  type MainTopicPerformance,
  type SubtopicPerformance,
  type TopicPerformanceBand,
  type TopicPerformanceWindow,
  type TopicTrend,
} from '@/modules/progress/domain/topic-performance';

export const TOPIC_WINDOW_OPTIONS: readonly TopicWindowOption[] = [
  { label: 'Son 7 gün', value: 'last7' },
  { label: 'Son 30 gün', value: 'last30' },
  { label: 'Tümü', value: 'all' },
];

/**
 * Presents one window of the topic report. The window is a view choice, so it
 * is applied here over the durable answer log rather than re-read from storage
 * every time the learner switches between them.
 */
export function buildTopicPerformanceViewModel(
  dashboard: ProgressDashboard,
  window: TopicPerformanceWindow = 'all',
): TopicPerformanceViewModel {
  const report =
    window === dashboard.topicPerformance.window
      ? dashboard.topicPerformance
      : buildTopicPerformance(dashboard.scoredAttempts, getContentIndex(), {
          moment: dashboard.observedAt,
          reviewItems: dashboard.reviewItems,
          window,
        });

  const totals = report.topics.reduce(
    (summary, topic) => ({
      correctAnswers: summary.correctAnswers + topic.correctAnswers,
      totalAttempts: summary.totalAttempts + topic.totalAttempts,
      wrongAnswers: summary.wrongAnswers + topic.wrongAnswers,
    }),
    { correctAnswers: 0, totalAttempts: 0, wrongAnswers: 0 },
  );
  const accuracy = totals.totalAttempts === 0 ? 0 : totals.correctAnswers / totals.totalAttempts;

  return {
    correctedToday: report.correctedToday.map(toCorrectedCard),
    emptyReason:
      report.attemptsAllTime === 0
        ? 'noData'
        : report.attemptsInWindow === 0
          ? 'noDataInWindow'
          : null,
    overall: {
      accuracy,
      accuracyLabel: percent(accuracy),
      correctAnswers: totals.correctAnswers,
      evidenceLabel: questionCount(totals.totalAttempts),
      lowEvidence: totals.totalAttempts > 0 && totals.totalAttempts < 3,
      mainTopics: report.topics.length,
      wrongAnswers: totals.wrongAnswers,
    },
    topics: report.topics.map(toMainTopicCard),
    window: report.window,
    windowOptions: TOPIC_WINDOW_OPTIONS,
  };
}

function toCorrectedCard(correction: {
  correctedQuestions: number;
  mainTopicTitle: string;
  subtopicId: string;
  title: string;
}): CorrectedTopicCard {
  return {
    detail: `${correction.correctedQuestions} soruyu düzelttin · ${correction.mainTopicTitle}`,
    id: correction.subtopicId,
    title: correction.title,
  };
}

function toMainTopicCard(topic: MainTopicPerformance): MainTopicCard {
  return {
    ...toCard(topic),
    coverageLabel: `${topic.coverage.total} alt konunun ${topic.coverage.measured} tanesi ölçüldü`,
    subtopics: topic.subtopics.map(toSubtopicCard),
  };
}

function toSubtopicCard(subtopic: SubtopicPerformance): SubtopicCard {
  return {
    ...toCard(subtopic),
    attemptSplitLabel:
      subtopic.firstAttemptAccuracy === null || subtopic.retryAccuracy === null
        ? null
        : `İlk denemede ${percent(subtopic.firstAttemptAccuracy)} · tekrarda ${percent(
            subtopic.retryAccuracy,
          )}`,
  };
}

function toCard(
  summary: MainTopicPerformance | SubtopicPerformance,
): Omit<MainTopicCard, 'coverageLabel' | 'subtopics'> {
  return {
    accuracy: summary.accuracy,
    accuracyLabel: percent(summary.accuracy),
    band: summary.band,
    detail: `${summary.correctAnswers} doğru · ${summary.wrongAnswers} yanlış`,
    evidenceLabel: questionCount(summary.totalAttempts),
    id: summary.id,
    lastStudiedLabel: lastStudiedLabel(summary.daysSinceLastAttempt, summary.lastAttemptAt),
    lowEvidenceNote: summary.hasEnoughEvidence
      ? null
      : 'Bu sonuç için henüz az veri var; çözdükçe netleşecek.',
    nextReviewLabel: reviewLabel(summary.nextReviewAt),
    staleLabel: summary.stale
      ? `${summary.daysSinceLastAttempt} gündür çözülmedi · tazeleme zamanı`
      : null,
    statusLabel: bandLabel(summary.band),
    title: summary.title,
    totalAttempts: summary.totalAttempts,
    trend: summary.trend,
    trendLabel: trendLabel(summary.trend),
  };
}

function percent(value: number): string {
  return `%${Math.round(value * 100)}`;
}

function questionCount(attempts: number): string {
  return `${attempts} soru`;
}

function lastStudiedLabel(days: number, atIso: string): string {
  if (days <= 0) {
    return 'Bugün çalıştın';
  }
  if (days === 1) {
    return 'Dün çalıştın';
  }
  if (days < 7) {
    return `${days} gün önce çalıştın`;
  }

  return `Son çalışma ${shortDate(atIso)}`;
}

function reviewLabel(atIso: string | null): string | null {
  return atIso === null ? null : `Sonraki tekrar ${shortDate(atIso)}`;
}

function shortDate(atIso: string): string {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(
    new Date(atIso),
  );
}

function trendLabel(trend: TopicTrend): string | null {
  switch (trend) {
    case 'rising':
      return 'Yükseliyor';
    case 'falling':
      return 'Düşüyor';
    case 'steady':
      return 'Sabit';
    case 'unknown':
      return null;
  }
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
