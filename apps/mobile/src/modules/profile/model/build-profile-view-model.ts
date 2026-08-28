import { describeProfile, initialFor } from '@/modules/learner/domain/learner-profile';
import type { ProfileViewModel } from '@/modules/profile/model/profile-view-model';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { evaluateBadges } from '@/modules/progress/domain/badge-policy';
import type { MainTopicPerformance } from '@/modules/progress/domain/topic-performance';

export function buildProfileViewModel(dashboard: ProgressDashboard): ProfileViewModel {
  const profile = dashboard.profile;
  const displayName = profile?.displayName ?? 'Öğrenci';
  const highestSubjectLevel = Math.max(
    0,
    ...[...dashboard.subjects.values()]
      .filter((entry) => entry.totalUnits > 0)
      .map((entry) => entry.level.level),
  );

  return {
    badges: evaluateBadges({
      bestStreak: dashboard.bestStreak,
      completedUnits: [...dashboard.subjects.values()].reduce(
        (sum, entry) => sum + entry.completedUnits,
        0,
      ),
      correctAnswers: dashboard.correctAnswers,
      highestSubjectLevel,
      lessonsCompleted: dashboard.completedSessions.lessons,
      perfectRounds: dashboard.perfectRounds,
      totalXp: dashboard.totalXp,
    }),
    description: profile === null ? 'Hesapsız yerel profil' : describeProfile(profile),
    displayName,
    initial: initialFor(displayName),
    level: dashboard.level.level,
    openMistakes: dashboard.mistakeNotebook.openCount,
    stats: [
      {
        id: 'rounds',
        label: 'Çalışma',
        value: String(dashboard.completedSessions.lessons),
      },
      { id: 'correct', label: 'Doğru', value: String(dashboard.correctAnswers) },
      { id: 'streak', label: 'En uzun seri', value: String(dashboard.bestStreak) },
    ],
    streak: dashboard.streak.current,
    totalXp: dashboard.totalXp,
    topicPerformance: dashboard.topicPerformance.topics.map(toTopicViewModel),
  };
}

function toTopicViewModel(topic: MainTopicPerformance): ProfileViewModel['topicPerformance'][number] {
  return {
    accuracy: topic.accuracy,
    accuracyLabel: `%${Math.round(topic.accuracy * 100)} doğruluk`,
    band: topic.band,
    correctAnswers: topic.correctAnswers,
    detail: `${topic.correctAnswers} doğru · ${topic.wrongAnswers} yanlış`,
    id: topic.id,
    nextReviewLabel: reviewLabel(topic.nextReviewAt),
    statusLabel: bandLabel(topic.band),
    subtopics: topic.subtopics.map((subtopic) => ({
      accuracy: subtopic.accuracy,
      accuracyLabel: `%${Math.round(subtopic.accuracy * 100)}`,
      band: subtopic.band,
      correctAnswers: subtopic.correctAnswers,
      detail: `${subtopic.correctAnswers} doğru · ${subtopic.wrongAnswers} yanlış`,
      id: subtopic.id,
      nextReviewLabel: reviewLabel(subtopic.nextReviewAt),
      statusLabel: bandLabel(subtopic.band),
      title: subtopic.title,
      totalAttempts: subtopic.totalAttempts,
      wrongAnswers: subtopic.wrongAnswers,
    })),
    title: topic.title,
    totalAttempts: topic.totalAttempts,
    wrongAnswers: topic.wrongAnswers,
  };
}

function reviewLabel(atIso: string | null): string | null {
  if (atIso === null) {
    return null;
  }
  return `Sonraki tekrar ${new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(atIso))}`;
}

function bandLabel(band: MainTopicPerformance['band']): string {
  switch (band) {
    case 'strong':
      return 'Güçlü';
    case 'needsPractice':
      return 'Tekrar gerekli';
    case 'developing':
      return 'Gelişiyor';
  }
}
