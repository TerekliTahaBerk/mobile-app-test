import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Badge } from '@/modules/progress/domain/badge-policy';
import type { ProfileViewModel } from '@/modules/profile/model/profile-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { ChevronIcon, LockIcon, StarIcon, StreakIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type ProfileScreenProps = {
  onOpenLeagueHistory: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
  onSelectTab: (tab: AppTabKey) => void;
  /** Shown on the Premium row when the entitlement is already held. */
  premiumActive: boolean;
  viewModel: ProfileViewModel;
};

/**
 * Profil. Every figure here is the learner's own local record — there is no
 * account behind it and nothing is fetched. Unearned badges stay visible as
 * locked tiles so the set reads as one collection.
 */
export function ProfileScreen({
  onOpenLeagueHistory,
  onOpenPremium,
  onOpenSettings,
  onSelectTab,
  premiumActive,
  viewModel,
}: ProfileScreenProps) {
  return (
    <Screen includeBottomInset={false} testID="profile-screen">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <AppText color="accentStrong" variant="headingXL">
              {viewModel.initial}
            </AppText>
          </View>
          <AppText accessibilityRole="header" align="center" style={styles.name} variant="headingL">
            {viewModel.displayName}
          </AppText>
          <AppText align="center" color="secondary" style={styles.description} variant="prose">
            {viewModel.description}
          </AppText>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <AppText color="success" variant="labelS">
                Level {viewModel.level}
              </AppText>
            </View>
            <View style={styles.chip}>
              <AppText color="success" variant="labelS">
                {viewModel.totalXp.toLocaleString('tr-TR')} XP
              </AppText>
            </View>
            <View style={[styles.chip, styles.chipStreak]}>
              <StreakIcon size={14} />
              <AppText color="streak" variant="labelS">
                {viewModel.streak}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          {viewModel.stats.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <AppText align="center" variant="numeric">
                {stat.value}
              </AppText>
              <AppText align="center" color="secondary" style={styles.statLabel} variant="caption">
                {stat.label}
              </AppText>
            </Card>
          ))}
        </View>

        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="headingS">
          Başarılarım
        </AppText>
        <View style={styles.badgeGrid}>
          {viewModel.badges.map((badge) => (
            <BadgeTile badge={badge} key={badge.id} />
          ))}
        </View>

        <Card style={styles.menu} variant="outlined">
          <MenuRow label="Lig Geçmişim" onPress={onOpenLeagueHistory} />
          <MenuRow
            badge={premiumActive ? '∞ can' : undefined}
            label="Premium"
            onPress={onOpenPremium}
          />
          <MenuRow label="Ayarlar" last onPress={onOpenSettings} />
        </Card>
      </ScrollView>

      <BottomTabBar activeTab="profil" onSelectTab={onSelectTab} />
    </Screen>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  return (
    <View
      accessibilityLabel={`${badge.label}${badge.earned ? '' : ', henüz kazanılmadı'}`}
      accessibilityRole="image"
      style={styles.badge}
      testID={`badge-${badge.id}`}
    >
      <View style={[styles.badgeFace, badge.earned ? styles.badgeEarned : styles.badgeLocked]}>
        {badge.earned ? (
          <StarIcon color={theme.colors.action.primary} size={26} />
        ) : (
          <LockIcon color={theme.colors.text.faint} size={20} />
        )}
      </View>
      <AppText
        align="center"
        color={badge.earned ? 'primary' : 'muted'}
        style={styles.badgeLabel}
        variant="caption"
      >
        {badge.label}
      </AppText>
    </View>
  );
}

function MenuRow({
  badge,
  label,
  last = false,
  onPress,
}: {
  badge?: string | undefined;
  label: string;
  last?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.menuRow, last ? null : styles.menuRowDivided]}
      testID={`profile-menu-${label}`}
    >
      <AppText style={styles.menuLabel} variant="labelM">
        {label}
      </AppText>
      {badge === undefined ? null : (
        <View style={styles.menuBadge}>
          <AppText color="success" variant="caption">
            {badge}
          </AppText>
        </View>
      )}
      <ChevronIcon color={theme.colors.text.muted} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
    borderRadius: theme.radii.pill,
    borderWidth: 3,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  badge: {
    flexBasis: '22%',
    flexGrow: 1,
  },
  badgeEarned: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.status.successBorder,
  },
  badgeFace: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: theme.radii.large + 2,
    borderWidth: 2,
    justifyContent: 'center',
    width: '100%',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md - 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md + 1,
  },
  badgeLabel: {
    fontSize: 10.5,
    marginTop: theme.spacing.xs + 2,
  },
  badgeLocked: {
    backgroundColor: theme.colors.surface.recessed,
    borderColor: theme.colors.border.strong,
    borderStyle: 'dashed',
  },
  chip: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs + 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 9,
  },
  chipStreak: {
    backgroundColor: theme.colors.reward.streakSoft,
  },
  chips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  description: {
    marginTop: theme.spacing.xxs,
  },
  identity: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg + 2,
  },
  menu: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    padding: 0,
  },
  menuBadge: {
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md - 1,
    paddingVertical: 5,
  },
  menuLabel: {
    flex: 1,
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    minHeight: theme.hitTarget + 8,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg + 2,
  },
  menuRowDivided: {
    borderBottomColor: theme.colors.border.subtle,
    borderBottomWidth: 1,
  },
  name: {
    marginTop: theme.spacing.md + 1,
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  statLabel: {
    marginTop: theme.spacing.xxs,
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xxl,
  },
});
