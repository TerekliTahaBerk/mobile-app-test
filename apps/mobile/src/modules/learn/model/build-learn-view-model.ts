import type { LearnViewModel, SubjectRow } from '@/modules/learn/model/learn-view-model';
import type {
  ProgressDashboard,
  SubjectProgress,
} from '@/modules/progress/application/use-progress-dashboard';
import { subjectTheme } from '@/shared/ui/theme/subject-theme';

export function buildLearnViewModel(
  dashboard: ProgressDashboard,
  hearts: number | null,
  examId = 'tyt',
): LearnViewModel {
  return {
    hearts,
    rows: (dashboard.byExam.get(examId) ?? [])
      .filter((entry) => entry.totalUnits > 0)
      .map(toRow),
    streak: dashboard.streak.current,
  };
}

function toRow(entry: SubjectProgress): SubjectRow {
  if (entry.totalUnits === 0) {
    return {
      detail: 'Yakında · içerik hazırlanıyor',
      id: entry.subject.id,
      locked: true,
      progress: 0,
      subjectTheme: subjectTheme(entry.subject.themeKey),
      title: entry.subject.title,
    };
  }

  const started = entry.progress > 0;

  return {
    detail: started
      ? `Level ${entry.level.level} · ${entry.completedUnits} / ${entry.totalUnits} ünite · ${entry.xp.toLocaleString('tr-TR')} XP`
      : `Yeni başla · ${entry.totalUnits} ünite`,
    id: entry.subject.id,
    locked: false,
    progress: entry.progress,
    subjectTheme: subjectTheme(entry.subject.themeKey),
    title: entry.subject.title,
  };
}
