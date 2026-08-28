import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { StarIcon } from '@/shared/ui/components/icons';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

export type LessonCompleteViewModel = {
  accuracyLabel: string;
  /** "Yeni node açıldı: Kut ve Töre" — omitted when nothing opened. */
  unlockedLabel: string | null;
  roundTitle: string;
  streak: number;
  unit: {
    /** The share of the unit already done before this round, 0–1. */
    before: number;
    /** What this round added, 0–1. */
    gained: number;
    title: string;
  } | null;
  xpEarned: number;
};

type LessonCompleteScreenProps = {
  onBackToHome: () => void;
  onNextRound: () => void;
  viewModel: LessonCompleteViewModel;
};

/**
 * The payoff. It states what was earned, shows the unit moving, and offers one
 * more round — the loop closes here rather than dropping the learner out.
 */
export function LessonCompleteScreen({
  onBackToHome,
  onNextRound,
  viewModel,
}: LessonCompleteScreenProps) {
  const unit = viewModel.unit;

  return (
    <Screen background="celebration" includeBottomInset={false} testID="lesson-complete-screen">
      <View style={styles.stage}>
        <Dino size={168} />
        <AppText align="center" color="inverse" style={styles.title} variant="headingXXL">
          Harika!
        </AppText>
        <AppText align="center" color="onDark" style={styles.subtitle} variant="bodyL">
          Çalışma tamamlandı · {viewModel.roundTitle}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        style={styles.sheet}
      >
        <View style={styles.statRow}>
          <Stat label="XP" tone="brand" value={`+${viewModel.xpEarned}`} />
          <Stat label="Doğru" tone="brand" value={viewModel.accuracyLabel} />
          <Stat label="Gün seri" tone="streak" value={String(viewModel.streak)} />
        </View>

        {unit === null ? null : (
          <View style={styles.unitCard}>
            <View style={styles.unitRow}>
              <AppText variant="bodyS">{unit.title}</AppText>
              <AppText color="secondary" variant="bodyS">
                %{Math.round(unit.before * 100)} →{' '}
                <AppText color="success" variant="bodyM">
                  %{Math.round((unit.before + unit.gained) * 100)}
                </AppText>
              </AppText>
            </View>
            <View style={styles.unitMeter}>
              <ProgressBar
                accessibilityLabel={`${unit.title} ilerlemesi`}
                gainValue={unit.gained}
                height={9}
                value={unit.before}
              />
            </View>
          </View>
        )}

        {viewModel.unlockedLabel === null ? null : (
          <View style={styles.unlocked}>
            <View style={styles.unlockedIcon}>
              <StarIcon color={theme.colors.subject.history.primary} size={18} />
            </View>
            <AppText style={styles.unlockedText} variant="bodyS">
              {viewModel.unlockedLabel}
            </AppText>
          </View>
        )}

        <AppButton
          label="Bir çalışma daha"
          onPress={onNextRound}
          style={styles.primaryAction}
          testID="lesson-complete-next"
        />
        <AppButton
          label="Ana Sayfa"
          onPress={onBackToHome}
          testID="lesson-complete-home"
          variant="ghost"
        />
      </ScrollView>
    </Screen>
  );
}

function Stat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'brand' | 'streak';
  value: string;
}) {
  const isStreak = tone === 'streak';

  return (
    <View
      style={[
        styles.stat,
        { backgroundColor: isStreak ? theme.colors.reward.streakSoft : theme.colors.surface.soft },
      ]}
    >
      <AppText align="center" color={isStreak ? 'streak' : 'success'} variant="numeric">
        {value}
      </AppText>
      <AppText
        align="center"
        color={isStreak ? 'streak' : 'secondary'}
        style={styles.statLabel}
        variant="caption"
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryAction: {
    marginTop: theme.spacing.lg + 2,
  },
  sheet: {
    backgroundColor: theme.colors.surface.default,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    flexGrow: 0,
  },
  sheetContent: {
    paddingBottom: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl + 2,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  stat: {
    borderRadius: theme.radii.large,
    flex: 1,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.lg + 1,
  },
  statLabel: {
    marginTop: theme.spacing.xxs,
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    opacity: 0.9,
  },
  title: {
    marginTop: theme.spacing.xs + 2,
  },
  unitCard: {
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large,
    borderWidth: 1,
    marginTop: theme.spacing.md + 1,
    padding: theme.spacing.lg + 1,
  },
  unitMeter: {
    marginTop: theme.spacing.md,
  },
  unitRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unlocked: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.history.soft,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md + 1,
    paddingHorizontal: theme.spacing.lg + 1,
    paddingVertical: theme.spacing.lg,
  },
  unlockedIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small - 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  unlockedText: {
    color: theme.colors.subject.history.deep,
    flex: 1,
  },
});
