import { ScrollView, StyleSheet, View } from 'react-native';

import type { LeagueEntry, LeagueViewModel } from '@/modules/league/model/league-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { StarIcon, StreakIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type LeagueScreenProps = {
  onSelectTab: (tab: AppTabKey) => void;
  viewModel: LeagueViewModel;
};

/**
 * The weekly league. The promotion zone is marked once, above the rows it
 * applies to, and the learner's own row is the only outlined one — so the two
 * questions the screen answers ("am I safe?" and "where am I?") are both
 * answerable at a glance.
 */
export function LeagueScreen({ onSelectTab, viewModel }: LeagueScreenProps) {
  const promoted = viewModel.entries.filter((entry) => entry.rank <= viewModel.promotionCount);
  const rest = viewModel.entries.filter((entry) => entry.rank > viewModel.promotionCount);

  return (
    <Screen includeBottomInset={false} testID="league-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.tierRow}>
            <View style={[styles.tier, styles.tierFar]} />
            <View style={[styles.tier, styles.tierNear]} />
            <View style={styles.tierCurrent}>
              <StarIcon color={theme.colors.surface.soft} size={28} />
            </View>
            <View style={[styles.tier, styles.tierNear]} />
            <View style={[styles.tier, styles.tierFar]} />
          </View>
          <AppText accessibilityRole="header" align="center" color="inverse" style={styles.title} variant="headingM">
            {viewModel.title}
          </AppText>
          <AppText align="center" color="onDark" style={styles.subtitle} variant="bodyS">
            {viewModel.subtitle} · {viewModel.closesIn}
          </AppText>
        </View>

        <View style={styles.rows}>
          <AppText color="accent" style={styles.zoneLabel} variant="eyebrow">
            YÜKSELME BÖLGESİ
          </AppText>
          {promoted.map((entry) => (
            <LeagueRow entry={entry} isSelf={entry.id === viewModel.selfId} key={entry.id} />
          ))}

          {rest.length === 0 ? null : <View style={styles.divider} />}
          {rest.map((entry) => (
            <LeagueRow entry={entry} isSelf={entry.id === viewModel.selfId} key={entry.id} />
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="lig" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function LeagueRow({ entry, isSelf }: { entry: LeagueEntry; isSelf: boolean }) {
  return (
    <View
      accessibilityLabel={`${entry.rank}. ${entry.name}, ${entry.xp} XP, ${entry.streak} günlük seri`}
      accessibilityRole="text"
      style={[styles.row, isSelf ? styles.rowSelf : null]}
      testID={`league-row-${entry.id}`}
    >
      <AppText color={isSelf ? 'success' : 'primary'} style={styles.rank} variant="labelM">
        {entry.rank}
      </AppText>
      <View style={[styles.avatar, isSelf ? styles.avatarSelf : null]}>
        <AppText color={isSelf ? 'inverse' : 'success'} variant="labelS">
          {[...entry.name][0]?.toLocaleUpperCase('tr-TR') ?? '?'}
        </AppText>
      </View>
      <View style={styles.rowBody}>
        <AppText color={isSelf ? 'success' : 'primary'} variant="bodyM">
          {entry.name}
        </AppText>
        <View style={styles.streakRow}>
          <StreakIcon size={12} />
          <AppText color="streak" variant="proseXS">
            {entry.streak} gün
          </AppText>
        </View>
      </View>
      <AppText color="success" variant="monoM">
        {entry.xp.toLocaleString('tr-TR')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarSelf: {
    backgroundColor: theme.colors.action.primary,
  },
  banner: {
    backgroundColor: theme.colors.action.primaryDepth,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg + 2,
  },
  divider: {
    backgroundColor: theme.colors.border.subtle,
    height: 1,
    marginVertical: theme.spacing.xs + 2,
  },
  rank: {
    minWidth: 26,
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
  },
  rowBody: {
    flex: 1,
  },
  rowSelf: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
    borderWidth: 2,
  },
  rows: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg + 2,
  },
  scroll: {
    paddingBottom: theme.spacing.xl,
  },
  streakRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: 1,
  },
  subtitle: {
    marginTop: 3,
  },
  tier: {
    borderRadius: theme.radii.small,
  },
  tierCurrent: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.large,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  tierFar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 34,
    width: 34,
  },
  tierNear: {
    backgroundColor: theme.colors.surface.onDark,
    height: 40,
    width: 40,
  },
  tierRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.lg,
  },
  zoneLabel: {
    paddingHorizontal: theme.spacing.xs,
  },
});
