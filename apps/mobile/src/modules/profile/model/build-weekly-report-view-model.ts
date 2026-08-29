import type { WeeklyReportDay } from '@/modules/learner/domain/learner-profile';
import type {
  ReportDayOption,
  WeeklyReportTopicRow,
  WeeklyReportViewModel,
} from '@/modules/profile/model/weekly-report-view-model';
import type { ReportedTopic, WeeklyReport } from '@/modules/progress/domain/weekly-report';

export const REPORT_DAY_OPTIONS: readonly ReportDayOption[] = [
  { label: 'Pazar', value: 0 },
  { label: 'Pazartesi', value: 1 },
  { label: 'Salı', value: 2 },
  { label: 'Çarşamba', value: 3 },
  { label: 'Perşembe', value: 4 },
  { label: 'Cuma', value: 5 },
  { label: 'Cumartesi', value: 6 },
];

export function buildWeeklyReportViewModel(
  report: WeeklyReport,
  day: WeeklyReportDay,
): WeeklyReportViewModel {
  const strengthened = report.strengthened.map(toRow);

  return {
    dateRange: `${shortDate(report.from)} – ${shortDate(report.to)}`,
    day,
    dayOptions: REPORT_DAY_OPTIONS,
    empty: report.questions === 0 && report.rounds === 0,
    notificationText: notificationTextFor(report),
    stats: [
      { id: 'questions', label: 'Çözülen soru', note: null, value: String(report.questions) },
      {
        id: 'accuracy',
        label: 'Doğruluk',
        // A percentage with no previous week to compare against says so rather
        // than implying the learner started from zero.
        note:
          report.accuracyDelta === null
            ? 'Karşılaştıracak önceki hafta yok'
            : `${signed(report.accuracyDelta)} puan`,
        value: report.accuracy === null ? '—' : percent(report.accuracy),
      },
      { id: 'rounds', label: 'Tamamlanan çalışma', note: null, value: String(report.rounds) },
      {
        id: 'days',
        label: 'Çalışılan gün',
        note: null,
        value: `${report.activeDays}/7`,
      },
    ],
    status: report.closed
      ? 'Hafta kapandı'
      : `Hafta sürüyor · ${dayLabel(day)} günü kapanır`,
    stillWeak: report.stillWeak.map(toRow),
    strengthened,
    suggestion: suggestionFor(report),
  };
}

/**
 * The push copy, kept here so the report and the notification can never say
 * different things once notifications are actually delivered.
 */
function notificationTextFor(report: WeeklyReport): string {
  if (report.strengthened.length > 0) {
    return `Bu hafta ${report.strengthened.length} alt konuyu güçlendirdin. Raporun hazır.`;
  }
  if (report.questions > 0) {
    return `Bu hafta ${report.questions} soru çözdün. Raporun hazır.`;
  }

  return 'Bu hafta hiç soru çözmedin. Kısa bir turla yeniden başlayabilirsin.';
}

function suggestionFor(report: WeeklyReport): string {
  const focus = report.stillWeak.slice(0, 2);
  if (focus.length > 0) {
    return `Önümüzdeki hafta ${focus.map((topic) => topic.title).join(' ve ')} konusuna öncelik ver.`;
  }
  if (report.questions === 0) {
    return 'Önümüzdeki hafta tek bir kısa turla yeniden başla; seri oradan kurulur.';
  }

  return 'Tekrar gereken konu kalmadı. Önümüzdeki hafta yeni konularla ilerleyebilirsin.';
}

function dayLabel(day: WeeklyReportDay): string {
  return REPORT_DAY_OPTIONS.find((option) => option.value === day)?.label ?? 'Pazar';
}

function toRow(topic: ReportedTopic): WeeklyReportTopicRow {
  return {
    detail: `${topic.mainTopicTitle} · ${percent(topic.accuracy)}`,
    id: topic.id,
    title: topic.title,
  };
}

function percent(value: number): string {
  return `%${Math.round(value * 100)}`;
}

function signed(delta: number): string {
  const points = Math.round(delta * 100);

  return points > 0 ? `+${points}` : String(points);
}

function shortDate(localDate: string): string {
  const [year, month, day] = localDate.split('-').map(Number);

  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(
    new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)),
  );
}
