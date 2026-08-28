import { ScrollView, StyleSheet, View } from 'react-native';

import type { StreakMilestoneViewModel } from '@/modules/streak/model/streak-view-model';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { CheckIcon, LeagueIcon, StreakIcon, TrophyIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type StreakMilestoneScreenProps = {
  onContinue: () => void;
  viewModel: StreakMilestoneViewModel;
};

/**
 * The streak milestone. It only appears on a day the run actually reached a
 * milestone; on any other day the learner goes straight back to the path,
 * because a celebration that fires every time stops meaning anything.
 */
export function StreakMilestoneScreen({ onContinue, viewModel }: StreakMilestoneScreenProps) {
  return (
    <Screen background="streak" includeBottomInset={false} testID="streak-screen">
      <View style={styles.stage}>
        <View style={styles.emblemRow}>
          <View style={styles.emblem}>
            <StreakIcon size={86} />
          </View>
          <Dino size={92} style={styles.mascot} />
        </View>

        <AppText align="center" style={styles.count} variant="display">
          {viewModel.streak}
        </AppText>
        <AppText accessibilityRole="header" align="center" style={styles.title} variant="headingXL">
          günlük seri!
        </AppText>
        <AppText align="center" style={styles.encouragement} variant="prose">
          {viewModel.encouragement}
        </AppText>

        <View style={styles.week}>
          {viewModel.week.map((day) => (
            <View key={day.date} style={styles.day}>
              <View
                style={[
                  styles.dayDot,
                  day.state === 'qualified' || day.state === 'today'
                    ? styles.dayDotDone
                    : styles.dayDotPending,
                  day.state === 'today' ? styles.dayDotToday : null,
                ]}
              >
                {day.state === 'qualified' || day.state === 'today' ? (
                  <CheckIcon size={day.state === 'today' ? 16 : 18} />
                ) : null}
              </View>
              <AppText
                align="center"
                color={day.state === 'future' ? 'muted' : 'streak'}
                style={styles.dayLabel}
                variant="caption"
              >
                {day.state === 'today' ? 'Bugün' : day.label}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        style={styles.sheet}
      >
        {viewModel.newBadge === null ? null : (
          <View style={[styles.reward, styles.rewardBadge]}>
            <View style={styles.rewardIcon}>
              <TrophyIcon />
            </View>
            <View style={styles.rewardBody}>
              <AppText style={styles.rewardTitle} variant="bodyM">
                {viewModel.newBadge}
              </AppText>
              <AppText color="subjectHistory" style={styles.rewardDetail} variant="proseXS">
                Profilinde toplandı
              </AppText>
            </View>
          </View>
        )}

        {viewModel.leagueMove === null ? null : (
          <View style={[styles.reward, styles.rewardLeague]}>
            <View style={styles.rewardIcon}>
              <LeagueIcon color={theme.colors.action.primary} size={20} />
            </View>
            <View style={styles.rewardBody}>
              <AppText color="success" variant="bodyM">
                {viewModel.leagueMove.title}
              </AppText>
              <AppText color="accentSoft" style={styles.rewardDetail} variant="proseXS">
                {viewModel.leagueMove.detail}
              </AppText>
            </View>
          </View>
        )}

        <AppButton
          label="Bir çalışma daha"
          onPress={onContinue}
          style={styles.action}
          testID="streak-continue"
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: theme.spacing.lg + 2,
  },
  count: {
    color: theme.colors.reward.streakInk,
    marginTop: theme.spacing.lg + 4,
  },
  day: {
    alignItems: 'center',
  },
  dayDot: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  dayDotDone: {
    backgroundColor: theme.colors.reward.streak,
  },
  dayDotPending: {
    borderColor: theme.colors.reward.streakDim,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  dayDotToday: {
    borderColor: theme.colors.reward.streakInk,
    borderWidth: 3,
  },
  dayLabel: {
    marginTop: theme.spacing.xs + 2,
  },
  emblem: {
    alignItems: 'center',
    backgroundColor: theme.colors.reward.streakSurface,
    borderRadius: theme.radii.pill,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
  emblemRow: {
    position: 'relative',
  },
  encouragement: {
    color: theme.colors.subject.history.ink,
    marginTop: theme.spacing.sm + 2,
  },
  mascot: {
    bottom: -10,
    position: 'absolute',
    right: -40,
  },
  reward: {
    alignItems: 'center',
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
    padding: theme.spacing.lg + 1,
  },
  rewardBadge: {
    backgroundColor: theme.colors.subject.history.soft,
  },
  rewardBody: {
    flex: 1,
  },
  rewardDetail: {
    marginTop: 1,
  },
  rewardIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small + 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  rewardLeague: {
    backgroundColor: theme.colors.surface.soft,
    marginTop: theme.spacing.md,
  },
  rewardTitle: {
    color: theme.colors.subject.history.deep,
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
    paddingTop: theme.spacing.xxl,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  title: {
    color: theme.colors.subject.history.deep,
  },
  week: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxxl,
  },
});
