import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { HeartIcon, StreakIcon } from '@/shared/ui/components/icons';
import { theme } from '@/shared/ui/theme/tokens';

export type HudChipKind = 'hearts' | 'streak';

type HudChipProps = {
  compact?: boolean;
  kind: HudChipKind;
  /** `null` renders the unlimited mark used by a premium account. */
  value: number | null;
};

/**
 * The two persistent counters in the app header: the daily streak and the
 * remaining hearts. Each announces itself in words so the count never depends
 * on recognising the icon.
 */
export function HudChip({ compact = false, kind, value }: HudChipProps) {
  const tone = toneByKind[kind];
  const display = value === null ? '∞' : String(value);
  const label =
    kind === 'streak'
      ? `${display} günlük seri`
      : value === null
        ? 'Sınırsız can'
        : `${value} can`;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      style={[styles.chip, compact ? styles.chipCompact : null, { backgroundColor: tone.surface }]}
    >
      {kind === 'streak' ? (
        <StreakIcon color={tone.icon} size={compact ? 15 : 17} />
      ) : (
        <HeartIcon color={tone.icon} size={compact ? 15 : 17} />
      )}
      <AppText
        style={[styles.value, compact ? styles.valueCompact : null, { color: tone.ink }]}
        variant="hud"
      >
        {display}
      </AppText>
    </View>
  );
}

const toneByKind = {
  hearts: {
    icon: theme.colors.reward.heart,
    ink: theme.colors.reward.heartInk,
    surface: theme.colors.reward.heartSoft,
  },
  streak: {
    icon: theme.colors.reward.streak,
    ink: theme.colors.reward.streakInk,
    surface: theme.colors.reward.streakSoft,
  },
} as const satisfies Record<HudChipKind, { icon: string; ink: string; surface: string }>;

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: theme.spacing.md + 1,
    paddingVertical: theme.spacing.sm,
  },
  chipCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 7,
  },
  value: {
    includeFontPadding: false,
  },
  valueCompact: {
    fontSize: 13.5,
  },
});
