import { StyleSheet, View } from 'react-native';

import {
  profilePreviewData,
  type BadgeSlot,
  type ProfileStat,
} from '@/modules/profile/model/profile-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { LockGlyph } from '@/shared/ui/components/glyphs';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { theme } from '@/shared/ui/theme/tokens';

export type LocalProfileStats = {
  completedLevels: number;
  iz: number;
  lessonsCompleted: number;
  reviewsCompleted: number;
  totalXp: number;
};

/** The "Profil" segment of design screen 12. */
export function ProfileOverview({ localStats }: { localStats?: LocalProfileStats | undefined }) {
  if (localStats !== undefined) {
    const stats: readonly ProfileStat[] = [
      { icon: 'gem', id: 'local-xp', label: 'Toplam XP', value: String(localStats.totalXp) },
      { icon: 'trace', id: 'local-iz', label: 'Günlük İz', value: String(localStats.iz) },
      { icon: 'net', id: 'local-lessons', label: 'Tamamlanan ders', value: String(localStats.lessonsCompleted) },
      { icon: 'league', id: 'local-reviews', label: 'Tamamlanan tekrar', value: String(localStats.reviewsCompleted) },
    ];

    return (
      <View style={styles.container}>
        <View accessible style={styles.identity}>
          <AppText accessibilityRole="header" variant="headingL">Bu cihazdaki ilerleme</AppText>
          <AppText color="muted" variant="proseS">
            Hesapsız pilot · kayıtlar yalnızca bu cihazda
          </AppText>
        </View>
        <View style={styles.statGrid}>
          {stats.map((stat) => (
            <View
              accessible
              accessibilityLabel={`${stat.label}: ${stat.value}`}
              key={stat.id}
              style={styles.statCard}
            >
              <StatIcon icon={stat.icon} />
              <View style={styles.statCopy}>
                <AppText numberOfLines={1} variant="headingXS">{stat.value}</AppText>
                <AppText color="muted" style={styles.countLabel} variant="bodyS">{stat.label}</AppText>
              </View>
            </View>
          ))}
        </View>
        <AppText color="muted" variant="bodyS">
          {`${localStats.completedLevels} gerçek yol seviyesi tamamlandı.`}
        </AppText>
      </View>
    );
  }

  const { badges, counts, identity, overviewTitle, stats } = profilePreviewData;

  return (
    <View style={styles.container}>
      <View accessible style={styles.identity}>
        <AppText accessibilityRole="header" variant="headingL">
          {identity.name}
        </AppText>
        <AppText color="muted" variant="proseS">
          {identity.handle}
        </AppText>
      </View>

      <View style={styles.countsRow}>
        {counts.map((count, index) => (
          <View key={count.id} style={styles.countGroup}>
            {index === 0 ? null : <View style={styles.countDivider} />}
            <View accessible accessibilityLabel={`${count.value} ${count.label}`}>
              <AppText variant="headingXS">{count.value}</AppText>
              <AppText color="muted" style={styles.countLabel} variant="bodyS">
                {count.label}
              </AppText>
            </View>
          </View>
        ))}

        <View style={styles.countsSpacer} />

        <TactilePressable
          accessibilityHint="Bu bölüm henüz hazır değil"
          accessibilityLabel={identity.inviteLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          depth={0}
          depthColor="transparent"
          disabled
          faceStyle={styles.inviteFace}
          onPress={() => undefined}
          radius={theme.radii.small + 1}
        >
          <AppText color="accent" variant="labelS">
            {identity.inviteLabel}
          </AppText>
        </TactilePressable>
      </View>

      <AppText accessibilityRole="header" variant="headingXS">
        {overviewTitle}
      </AppText>

      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View
            accessible
            accessibilityLabel={`${stat.label}: ${stat.value}`}
            key={stat.id}
            style={styles.statCard}
          >
            <StatIcon icon={stat.icon} />
            <View style={styles.statCopy}>
              <AppText numberOfLines={1} variant="headingXS">
                {stat.value}
              </AppText>
              <AppText color="muted" style={styles.countLabel} variant="bodyS">
                {stat.label}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.badgeHeader}>
        <AppText accessibilityRole="header" variant="headingXS">
          {badges.title}
        </AppText>
        <AppText color="accent" variant="labelS">
          {badges.earnedLabel}
        </AppText>
      </View>

      <View style={styles.badgeGrid}>
        {badges.slots.map((slot) => (
          <BadgeTile key={slot.id} slot={slot} />
        ))}
      </View>
    </View>
  );
}

function StatIcon({ icon }: { icon: ProfileStat['icon'] }) {
  if (icon === 'trace') {
    return <TraceMark size="xs" />;
  }
  if (icon === 'gem') {
    return <View style={[styles.statChip, { backgroundColor: theme.colors.reward.xp }]} />;
  }
  if (icon === 'net') {
    return (
      <View style={[styles.statChip, { backgroundColor: theme.colors.subject.history.primary }]} />
    );
  }

  return (
    <View style={styles.trophy}>
      <View style={styles.trophyCup} />
      <View style={styles.trophyBase} />
    </View>
  );
}

function BadgeTile({ slot }: { slot: BadgeSlot }) {
  const tone = badgeTones[slot.tone];

  return (
    <View
      accessible
      accessibilityLabel={slot.label}
      style={[styles.badgeTile, { backgroundColor: tone.surface }]}
    >
      {slot.tone === 'locked' ? (
        <LockGlyph size={22} />
      ) : slot.tone === 'more' ? (
        <AppText color="disabled" variant="labelS">
          +17
        </AppText>
      ) : (
        <View style={[styles.badgeMark, { backgroundColor: tone.mark }]} />
      )}
    </View>
  );
}

const badgeTones: Record<BadgeSlot['tone'], { mark: string; surface: string }> = {
  geography: {
    mark: theme.colors.subject.geography.primary,
    surface: theme.colors.subject.geography.soft,
  },
  history: {
    mark: theme.colors.subject.history.primary,
    surface: theme.colors.subject.history.soft,
  },
  locked: { mark: theme.colors.path.lockedGlyph, surface: theme.colors.surface.recessed },
  more: { mark: theme.colors.text.disabled, surface: theme.colors.surface.recessed },
  philosophy: {
    mark: theme.colors.subject.philosophy.primary,
    surface: theme.colors.subject.philosophy.soft,
  },
  religion: {
    mark: theme.colors.subject.religion.primary,
    surface: theme.colors.subject.religion.soft,
  },
  reward: { mark: theme.colors.reward.xpDepth, surface: theme.colors.reward.xpSoft },
  trace: { mark: theme.colors.trace.mid, surface: theme.colors.trace.surface },
};

const styles = StyleSheet.create({
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
  },
  badgeHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeMark: {
    borderRadius: theme.radii.xs,
    height: 24,
    width: 24,
  },
  badgeTile: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: theme.radii.medium + 2,
    flexBasis: '22%',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 62,
  },
  container: {
    gap: theme.spacing.lg,
  },
  countDivider: {
    backgroundColor: theme.colors.border.hairline,
    height: 26,
    width: 2,
  },
  countGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  countLabel: {
    marginTop: theme.spacing.xs,
  },
  countsRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  countsSpacer: {
    flex: 1,
  },
  identity: {
    gap: theme.spacing.xs,
  },
  inviteFace: {
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingHorizontal: theme.spacing.md + 2,
  },
  statCard: {
    alignItems: 'center',
    borderColor: theme.colors.border.hairline,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    flexBasis: '46%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: theme.spacing.md - 1,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: theme.spacing.md + 1,
  },
  statChip: {
    borderRadius: 5,
    height: 18,
    width: 18,
  },
  statCopy: {
    flexShrink: 1,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
  },
  trophy: {
    height: 18,
    width: 18,
  },
  trophyBase: {
    backgroundColor: theme.colors.reward.xpDepth,
    borderRadius: 2,
    bottom: 0,
    height: 4,
    left: 5,
    position: 'absolute',
    width: 8,
  },
  trophyCup: {
    backgroundColor: theme.colors.reward.xp,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    height: 12,
    left: 1,
    position: 'absolute',
    top: 0,
    width: 16,
  },
});
