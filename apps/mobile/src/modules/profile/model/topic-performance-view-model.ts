import type {
  TopicPerformanceBand,
  TopicPerformanceWindow,
  TopicTrend,
} from '@/modules/progress/domain/topic-performance';

export type TopicWindowOption = {
  label: string;
  value: TopicPerformanceWindow;
};

/** Why the report has nothing to show, so the screen can say which of the two it is. */
export type TopicPerformanceEmptyReason = 'noData' | 'noDataInWindow';

export type CorrectedTopicCard = {
  detail: string;
  id: string;
  title: string;
};

export type SubtopicCard = {
  accuracy: number;
  accuracyLabel: string;
  band: TopicPerformanceBand;
  /** "İlk denemede %60 · tekrarda %90", or null when one side has no answers. */
  attemptSplitLabel: string | null;
  detail: string;
  /** "34 soru" — never let a percentage stand on its own. */
  evidenceLabel: string;
  id: string;
  lastStudiedLabel: string;
  /** Present while the sample is too small to read as a measurement. */
  lowEvidenceNote: string | null;
  nextReviewLabel: string | null;
  /** Present when a strength has gone untouched long enough to be worth re-measuring. */
  staleLabel: string | null;
  statusLabel: string;
  title: string;
  totalAttempts: number;
  trend: TopicTrend;
  trendLabel: string | null;
};

export type MainTopicCard = Omit<SubtopicCard, 'attemptSplitLabel'> & {
  /** "8 alt konunun 3 tanesi ölçüldü" */
  coverageLabel: string;
  subtopics: readonly SubtopicCard[];
};

export type TopicPerformanceViewModel = {
  correctedToday: readonly CorrectedTopicCard[];
  emptyReason: TopicPerformanceEmptyReason | null;
  overall: {
    accuracy: number;
    accuracyLabel: string;
    correctAnswers: number;
    evidenceLabel: string;
    lowEvidence: boolean;
    mainTopics: number;
    wrongAnswers: number;
  };
  topics: readonly MainTopicCard[];
  window: TopicPerformanceWindow;
  windowOptions: readonly TopicWindowOption[];
};
