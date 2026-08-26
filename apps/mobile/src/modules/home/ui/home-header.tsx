import { StyleSheet, View } from 'react-native';

import type { HomePreviewViewModel } from '@/modules/home/model/home-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

type HomeHeaderProps = Pick<
  HomePreviewViewModel,
  'brandName' | 'companionName' | 'greeting' | 'mode' | 'stats' | 'subtitle'
>;

export function HomeHeader({
  brandName,
  companionName,
  greeting,
  mode,
  stats,
  subtitle,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View accessible accessibilityLabel={`${companionName}, TEKRARLA çalışma arkadaşı`} style={styles.brandMark}>
          <AppText color="inverse" variant="headingM">
            Ç
          </AppText>
          <View style={styles.companionDot} />
        </View>
        <View style={styles.brandCopy}>
          <AppText accessibilityRole="header" color="accent" variant="headingM">
            {brandName}
          </AppText>
          <AppText color="muted" variant="caption">
            {companionName} · ÇALIŞMA ARKADAŞIN
          </AppText>
        </View>
        <View accessible accessibilityLabel={`${mode} modu`} style={styles.modePill}>
          <AppText color="accent" variant="labelM">
            {mode}
          </AppText>
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="headingXL">
          {greeting}
        </AppText>
        <AppText color="secondary" variant="bodyM">
          {subtitle}
        </AppText>
      </View>

      <View style={styles.statsRow}>
        <View accessible accessibilityLabel={`Çalışma izi ${stats.trace}`} style={[styles.statPill, styles.tracePill]}>
          <AppText color="accent" variant="caption">
            İZ
          </AppText>
          <AppText variant="headingM">{stats.trace}</AppText>
        </View>
        <View accessible accessibilityLabel={`Toplam deneyim puanı ${stats.xp}`} style={[styles.statPill, styles.xpPill]}>
          <AppText color="secondary" variant="caption">
            XP
          </AppText>
          <AppText variant="headingM">{stats.xp}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandMark: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.medium,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    transform: [{ rotate: '-6deg' }],
    width: 44,
  },
  brandCopy: {
    flex: 1,
  },
  companionDot: {
    backgroundColor: theme.colors.reward.highlight,
    borderRadius: theme.radii.pill,
    height: 8,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  container: {
    gap: theme.spacing.xl,
  },
  copy: {
    gap: theme.spacing.sm,
  },
  modePill: {
    backgroundColor: theme.colors.action.primarySoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  statPill: {
    alignItems: 'center',
    borderRadius: theme.radii.medium,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tracePill: {
    backgroundColor: theme.colors.reward.traceSoft,
  },
  xpPill: {
    backgroundColor: theme.colors.reward.xpSurface,
  },
});
