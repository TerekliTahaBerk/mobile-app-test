import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Badge } from '@/modules/progress/domain/badge-policy';
import type { ProfileViewModel } from '@/modules/profile/model/profile-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { ChevronIcon, LockIcon, StarIcon, StreakIcon, TargetIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { BottomTabBar, type AppTabKey } from '@/shared/ui/navigation/bottom-tab-bar';
import { theme } from '@/shared/ui/theme/tokens';

type ProfileScreenProps = {
  onOpenLeagueHistory?: (() => void) | undefined;
  onOpenPremium?: (() => void) | undefined;
  onOpenSettings: () => void;
  onOpenTopicPerformance: () => void;
  onSelectTab: (tab: AppTabKey) => void;
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
  onOpenTopicPerformance,
  onSelectTab,
  viewModel,
}: ProfileScreenProps) {
  const needsPractice = viewModel.topicPerformance.filter(
    (topic) => topic.band === 'needsPractice',
  ).length;
  const strong = viewModel.topicPerformance.filter((topic) => topic.band === 'strong').length;

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
          Konu performansın
        </AppText>
        <TactilePressable
          accessibilityLabel="Konu performansı detayını aç"
          accessibilityRole="button"
          depthColor={theme.colors.action.primaryDepth}
          faceStyle={styles.performanceFace}
          onPress={onOpenTopicPerformance}
          style={styles.performanceEntry}
          testID="profile-topic-performance"
        >
          <View style={styles.performanceHeader}>
            <View style={styles.performanceIcon}>
              <TargetIcon color={theme.colors.status.successInk} size={24} />
            </View>
            <View style={styles.performanceHeading}>
              <AppText variant="headingXS">
                {viewModel.topicPerformance.length === 0
                  ? 'İlk verini oluşturalım'
                  : `${viewModel.topicPerformance.length} ana konu izleniyor`}
              </AppText>
              <AppText color="secondary" variant="proseS">
                Doğru ve yanlışlarını ana konu ile alt konu düzeyinde incele.
              </AppText>
            </View>
            <ChevronIcon color={theme.colors.text.accentStrong} />
          </View>
          {viewModel.topicPerformance.length === 0 ? null : (
            <View style={styles.performanceMetrics}>
              <View style={styles.performanceMetric}>
                <AppText color="danger" variant="numeric">
                  {needsPractice}
                </AppText>
                <AppText color="secondary" variant="caption">
                  Tekrar gerekli
                </AppText>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceMetric}>
                <AppText color="success" variant="numeric">
                  {strong}
                </AppText>
                <AppText color="secondary" variant="caption">
                  Güçlü konu
                </AppText>
              </View>
            </View>
          )}
        </TactilePressable>

        <AppText accessibilityRole="header" style={styles.sectionTitle} variant="headingS">
          Başarılarım
        </AppText>
        <View style={styles.badgeGrid}>
          {viewModel.badges.map((badge) => (
            <BadgeTile badge={badge} key={badge.id} />
          ))}
        </View>

        <Card style={styles.menu} variant="outlined">
          {onOpenLeagueHistory === undefined ? null : (
            <MenuRow label="Lig Geçmişim" onPress={onOpenLeagueHistory} />
          )}
          {onOpenPremium === undefined ? null : (
            <MenuRow label="Premium" onPress={onOpenPremium} />
          )}
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
  performanceDivider: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.border.subtle,
    width: 1,
  },
  performanceEntry: {
    marginHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  performanceFace: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.accent,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    padding: theme.spacing.lg,
  },
  performanceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  performanceHeading: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  performanceIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.status.successSoft,
    borderRadius: theme.radii.medium,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  performanceMetric: {
    alignItems: 'center',
    flex: 1,
  },
  performanceMetrics: {
    borderTopColor: theme.colors.border.hairline,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
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
