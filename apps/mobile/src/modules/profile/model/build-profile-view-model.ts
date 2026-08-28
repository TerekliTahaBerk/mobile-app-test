import { describeProfile, initialFor } from '@/modules/learner/domain/learner-profile';
import type { ProfileViewModel } from '@/modules/profile/model/profile-view-model';
import type { ProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { evaluateBadges } from '@/modules/progress/domain/badge-policy';

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
  };
}
