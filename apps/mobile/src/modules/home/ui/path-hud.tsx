import { StyleSheet, View } from 'react-native';

import type { HomeViewModel } from '@/modules/home/model/home-view-model';
import { AppText } from '@/shared/ui/components/app-text';
import { GemGlyph, HeartGlyph } from '@/shared/ui/components/glyphs';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { theme } from '@/shared/ui/theme/tokens';

type PathHudProps = {
  hud: HomeViewModel['hud'];
};

/**
 * The status strip above the path: exam mode and level, the İz trace, gems,
 * and remaining hearts. Each stat is one accessible unit so a screen reader
 * reads "13 günlük iz" rather than a bare number.
 */
export function PathHud({ hud }: PathHudProps) {
  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityLabel={hud.level === undefined ? hud.mode : `${hud.mode} seviye ${hud.level}`}
        style={styles.stat}
      >
        <View style={styles.modeChip}>
          <AppText style={styles.modeChipText} variant="eyebrow">
            {hud.mode}
          </AppText>
        </View>
        {hud.level === undefined ? null : (
          <AppText color="muted" variant="hud">{hud.level}</AppText>
        )}
      </View>

      <View accessible accessibilityLabel={`${hud.trace} günlük iz`} style={styles.stat}>
        <TraceMark size="xs" />
        <AppText color="accentStrong" variant="hud">
          {hud.trace}
        </AppText>
      </View>

      {hud.xp === undefined ? null : (
        <View accessible accessibilityLabel={hud.xp} style={styles.stat}>
          <View style={styles.xpDot} />
          <AppText color="gem" variant="hud">{hud.xp}</AppText>
        </View>
      )}

      {hud.gems === undefined ? null : (
        <View accessible accessibilityLabel={`${hud.gems} elmas`} style={styles.stat}>
          <GemGlyph />
          <AppText color="gem" variant="hud">{hud.gems}</AppText>
        </View>
      )}

      {hud.hearts === undefined ? null : (
        <View accessible accessibilityLabel={`${hud.hearts} can`} style={styles.stat}>
          <HeartGlyph />
          <AppText color="heart" variant="hud">{hud.hearts}</AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modeChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.history.soft,
    borderRadius: theme.radii.xs,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  modeChipText: {
    color: theme.colors.subject.history.ink,
    fontSize: 9,
    letterSpacing: 0,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: theme.hitTarget - 12,
  },
  xpDot: {
    backgroundColor: theme.colors.reward.xp,
    borderRadius: theme.radii.pill,
    height: 14,
    width: 14,
  },
});
