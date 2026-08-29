import { getContentIndex } from '@/modules/curriculum/content/content-source';
import { initialFor } from '@/modules/learner/domain/learner-profile';
import { buildDailyPlanCard } from '@/modules/learning/model/daily-plan-card';
import type { HomeViewModel, PersonalizedCard } from '@/modules/home/model/home-view-model';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';

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
): HomeViewModel {
  const index = getContentIndex();
  const name = dashboard.profile?.displayName ?? null;

  return {
    continueCard: buildContinueCard(dashboard),
    dailyPlan: buildDailyPlanCard(dashboard.dailyPlan),
    dailyProgress: dashboard.dailyProgress,
    greeting: name === null ? 'Merhaba' : `Merhaba, ${name}`,
    hearts,
    initial: name === null ? '?' : initialFor(name),
    // The route stays discoverable while its backend is pending, but Home never
    // invents a rank or opponent for a production learner.
    leagueCard: {
      detail: 'Haftalık sıralama altyapısı hazırlanıyor.',
      kind: 'pending',
      title: 'Lig',
    },
    level: dashboard.level.level,
    levelProgress: dashboard.level.progress,
    personalizedCard: buildPersonalizedCard(dashboard),
    streak: dashboard.streak.current,
    xpForLevel: dashboard.level.xpForLevel,
    xpIntoLevel: dashboard.level.xpIntoLevel,
  };

  function buildContinueCard(source: ProgressDashboard): HomeViewModel['continueCard'] {
    const active = source.activeSession;
    const step = source.nextStep;
    const lessonId = active?.lessonId ?? step?.node.lessonId;
    if (lessonId === undefined) return null;

    const lesson = index.getLesson(lessonId);
    const topic = index.getTopic(lesson.topicId);
    const unit = index.getUnit(topic.unitId);
    const subject = index.getSubjectOfUnit(unit.id);
    const path = source.subjects
      .get(subject.id)
      ?.paths.find((candidate) => candidate.unitId === unit.id);
    const percent = Math.round((path?.completion ?? 0) * 100);

    if (active !== null) {
      return {
        action: { kind: 'resume', sessionId: active.sessionId },
        actionLabel: 'Devam',
        detail: `${unit.title} · %${percent}`,
        eyebrow: 'KALDIĞIN YERDEN',
        subjectTitle: `TYT ${subject.title}`,
      };
    }

    if (step === null || step.node.lessonId === undefined) {
      return null;
    }

    return {
      action: {
        kind: 'lesson',
        lessonId: step.node.lessonId,
        pathNodeId: step.node.id,
      },
      actionLabel: 'Başla',
      detail: `${unit.title} · %${percent}`,
      eyebrow: 'SIRADAKİ ÇALIŞMA',
      subjectTitle: `${index.bundle.exams.find((exam) => exam.id === subject.examId)?.title ?? ''} ${subject.title}`.trim(),
    };
  }
}

function buildPersonalizedCard(dashboard: ProgressDashboard): PersonalizedCard | null {
  const review = dashboard.dailyPlan.parts.find((part) => part.kind === 'review');
  if (review !== undefined) {
    return {
      actionLabel: 'Plana geç',
      detail: `${review.exercises.length} zamanı gelen soru bugünkü planında hazır.`,
      eyebrow: 'SANA ÖZEL',
      kind: 'review',
      title: 'Tekrar zamanı',
    };
  }

  const weak = dashboard.dailyPlan.parts.find((part) => part.kind === 'weakTopic');
  if (weak !== undefined) {
    return {
      actionLabel: 'Güçlendir',
      detail: `${weak.topicTitles[0] ?? 'Zorlandığın konu'} için ${weak.exercises.length} soruluk kısa çalışma hazır.`,
      eyebrow: 'SANA ÖZEL',
      kind: 'weakTopic',
      title: 'Bunu güçlendirelim',
    };
  }

  if (!dashboard.streak.todayQualified && dashboard.dailyPlan.exercises.length > 0) {
    return {
      actionLabel: 'Başla',
      detail: 'Bugünkü hedefin için kısa bir çalışma yeterli.',
      eyebrow: 'BUGÜN',
      kind: 'streak',
      title: dashboard.streak.current > 0 ? 'Serini koru' : 'Serini başlat',
    };
  }

  return null;
}
