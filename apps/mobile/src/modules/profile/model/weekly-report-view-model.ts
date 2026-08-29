import type { WeeklyReportDay } from '@/modules/learner/domain/learner-profile';

export type WeeklyReportStat = {
  id: string;
  label: string;
  /** Absent when the week has no evidence for this figure. */
  note: string | null;
  value: string;
};

export type WeeklyReportTopicRow = {
  detail: string;
  id: string;
  title: string;
};

export type ReportDayOption = {
  label: string;
  value: WeeklyReportDay;
};

export type WeeklyReportViewModel = {
  /** "22 Ağu – 28 Ağu" */
  dateRange: string;
  day: WeeklyReportDay;
  dayOptions: readonly ReportDayOption[];
  /** True while the week holds nothing to report. */
  empty: boolean;
  /** The push copy this report would carry, once notifications exist. */
  notificationText: string;
  stats: readonly WeeklyReportStat[];
  /** "Hafta sürüyor · Pazar günü kapanır" */
  status: string;
  stillWeak: readonly WeeklyReportTopicRow[];
  strengthened: readonly WeeklyReportTopicRow[];
  /** What the report suggests doing next week, in one sentence. */
  suggestion: string;
};
