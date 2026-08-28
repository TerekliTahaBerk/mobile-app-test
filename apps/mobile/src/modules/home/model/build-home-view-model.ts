import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { initialFor } from '@/modules/learner/domain/learner-profile';
import type { HomeViewModel, SubjectTile } from '@/modules/home/model/home-view-model';
import type {
  ProgressDashboard,
  SubjectProgress,
} from '@/modules/progress/application/use-progress-dashboard';
import { subjectTheme } from '@/shared/ui/theme/subject-theme';

/**
 * Turns the live dashboard into what Ana Sayfa renders.
 *
 * A subject with no authored units reports `level: null` rather than a level of
 * zero, because "we have not written this yet" and "you have not started this
 * yet" are different facts and the screen says different things about them.
 */
export function buildHomeViewModel(
  dashboard: ProgressDashboard,
  hearts: number | null,
  examId = 'tyt',
): HomeViewModel {
  const index = getContentIndex();
  const name = dashboard.profile?.displayName ?? null;
  const subjects = dashboard.byExam.get(examId) ?? [];

  return {
    continueCard: buildContinueCard(dashboard),
    greeting: name === null ? 'Merhaba' : `Merhaba, ${name}`,
    hearts,
    initial: name === null ? '?' : initialFor(name),
    // The league needs a real leaderboard service; until then the row is absent
    // rather than showing a rank that was never earned against anyone.
    leagueRank: null,
    level: dashboard.level.level,
    levelProgress: dashboard.level.progress,
    streak: dashboard.streak.current,
    subjects: subjects.map(toTile),
    xpForLevel: dashboard.level.xpForLevel,
    xpIntoLevel: dashboard.level.xpIntoLevel,
  };

  function buildContinueCard(source: ProgressDashboard): HomeViewModel['continueCard'] {
    const step = source.nextStep;
    if (step === null || step.node.lessonId === undefined) {
      return null;
    }

    const unit = index.getUnit(step.node.unitId);
    const subject = index.getSubjectOfUnit(unit.id);
    const path = source.subjects
      .get(subject.id)
      ?.paths.find((candidate) => candidate.unitId === unit.id);
    const percent = Math.round((path?.completion ?? 0) * 100);

    return {
      detail: `${unit.title} · %${percent}`,
      lessonId: step.node.lessonId,
      pathNodeId: step.node.id,
      subjectTitle: `${index.bundle.exams.find((exam) => exam.id === subject.examId)?.title ?? ''} ${subject.title}`.trim(),
    };
  }
}

function toTile(entry: SubjectProgress): SubjectTile {
  const available = entry.totalUnits > 0;

  return {
    id: entry.subject.id,
    level: available ? entry.level.level : null,
    progress: entry.progress,
    subjectTheme: subjectTheme(entry.subject.themeKey),
    title: entry.subject.title,
  };
}
