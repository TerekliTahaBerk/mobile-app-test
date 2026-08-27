import { StyleSheet, View } from 'react-native';

import { profilePreviewData, type LeagueRow } from '@/modules/profile/model/profile-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

/** The "Lig" segment of design screen 12. Standings are fixture text. */
export function LeagueBoard() {
  const { league } = profilePreviewData;

  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityLabel={`${league.title}. ${league.countdown}. Sıran: ${league.rank}`}
        style={styles.banner}
      >
        <View style={styles.trophy}>
          <View style={styles.trophyCup} />
          <View style={styles.trophyBase} />
        </View>

        <View style={styles.bannerCopy}>
          <AppText style={styles.bannerTitle} variant="headingS">
            {league.title}
          </AppText>
          <AppText style={styles.bannerMeta} variant="bodyS">
            {league.countdown}
          </AppText>
        </View>

        <View style={styles.rankChip}>
          <AppText align="center" style={styles.bannerTitle} variant="headingXS">
            {league.rank}
          </AppText>
          <AppText align="center" style={styles.rankChipLabel} variant="eyebrow">
            {league.rankLabel}
          </AppText>
        </View>
      </View>

      <View style={styles.promotionRow}>
        <View style={styles.promotionRule} />
        <AppText style={styles.promotionLabel} variant="eyebrow">
          {league.promotionLabel}
        </AppText>
        <View style={styles.promotionRule} />
      </View>

      <View style={styles.rows}>
        {league.rows.map((row) => (
          <LeagueRowItem key={row.id} row={row} />
        ))}
      </View>
    </View>
  );
}

function LeagueRowItem({ row }: { row: LeagueRow }) {
  const rankColor = row.promoted
    ? theme.colors.reward.xpDepth
    : row.isMe
      ? theme.colors.text.accent
      : theme.colors.text.muted;

  return (
    <View
      accessible
      accessibilityLabel={`${row.rank}. sıra. ${row.name}. ${row.tag}. ${row.xp} XP${
        row.promoted ? '. Yükselme bölgesinde' : ''
      }`}
      style={[
        styles.row,
        row.isMe && { backgroundColor: theme.colors.action.primaryTint, borderColor: theme.colors.action.primary },
      ]}
    >
      <AppText align="center" style={[styles.rank, { color: rankColor }]} variant="headingXS">
        {row.rank}
      </AppText>

      <View
        style={[
          styles.avatar,
          {
            backgroundColor: row.isMe
              ? theme.colors.action.primarySoft
              : theme.colors.surface.recessed,
          },
        ]}
      >
        <AppText color={row.isMe ? 'accent' : 'eyebrow'} variant="labelS">
          {row.initials}
        </AppText>
      </View>

      <View style={styles.rowCopy}>
        <AppText color="body" variant="bodyS">
          {row.name}
        </AppText>
        <AppText color="muted" style={styles.rowTag} variant="bodyS">
          {row.tag}
        </AppText>
      </View>

      <AppText color="secondary" variant="labelS">
        {row.xp}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: theme.radii.small - 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  banner: {
    alignItems: 'center',
    backgroundColor: theme.colors.reward.xpSoft,
    borderColor: theme.colors.reward.xp,
    borderRadius: theme.radii.xlarge - 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg,
  },
  bannerCopy: {
    flex: 1,
    gap: theme.spacing.xxs + 1,
  },
  bannerMeta: {
    color: theme.colors.reward.xpNumber,
  },
  bannerTitle: {
    color: theme.colors.reward.xpInk,
  },
  container: {
    gap: theme.spacing.lg,
  },
  promotionLabel: {
    color: theme.colors.subject.geography.ink,
    letterSpacing: 1.2,
  },
  promotionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  promotionRule: {
    backgroundColor: theme.colors.subject.geography.soft,
    flex: 1,
    height: 2,
  },
  rank: {
    width: 22,
  },
  rankChip: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small - 1,
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md - 1,
    paddingVertical: theme.spacing.sm + 1,
  },
  rankChipLabel: {
    color: theme.colors.reward.xpNumber,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.hairline,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
  },
  rowCopy: {
    flex: 1,
    gap: theme.spacing.xxs + 1,
  },
  rowTag: {
    fontSize: 11.5,
  },
  rows: {
    gap: 7,
  },
  trophy: {
    height: 46,
    width: 46,
  },
  trophyBase: {
    backgroundColor: theme.colors.reward.xpDepth,
    borderRadius: 4,
    bottom: 2,
    height: 8,
    left: 13,
    position: 'absolute',
    width: 20,
  },
  trophyCup: {
    backgroundColor: theme.colors.reward.xp,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 28,
    left: 5,
    position: 'absolute',
    top: 2,
    width: 36,
  },
});
