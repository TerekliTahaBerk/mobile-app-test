import { Pressable, StyleSheet, View } from 'react-native';

import type { HomePreviewViewModel } from '@/modules/home/model/home-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

type UnitBannerProps = {
  onOpenUnitIndex?: (() => void) | undefined;
  unit: HomePreviewViewModel['unit'];
};

/**
 * The subject-tinted band that tells the learner where on the curriculum they
 * are standing, with the unit index affordance on its right edge.
 */
export function UnitBanner({ onOpenUnitIndex, unit }: UnitBannerProps) {
  const tone = theme.colors.subject[unit.subject];

  return (
    <View style={styles.frame}>
      <View style={[styles.depth, { backgroundColor: theme.colors.path.unitDepth }]} />
      <View style={[styles.banner, { backgroundColor: theme.colors.path.unitFace }]}>
        <View accessible accessibilityRole="header" style={styles.copy}>
          <AppText style={{ color: tone.ink }} variant="eyebrow">
            {unit.eyebrow}
          </AppText>
          <AppText style={[styles.title, { color: tone.deep }]} variant="headingS">
            {unit.title}
          </AppText>
        </View>

        <Pressable
          accessibilityHint="Ünitedeki dersleri listeler"
          accessibilityLabel="Ünite içeriği"
          accessibilityRole="button"
          accessibilityState={{ disabled: onOpenUnitIndex === undefined }}
          disabled={onOpenUnitIndex === undefined}
          onPress={onOpenUnitIndex}
          style={[styles.indexButton, { borderLeftColor: 'rgba(122, 74, 34, 0.18)' }]}
        >
          <View importantForAccessibility="no-hide-descendants" style={styles.indexGlyph}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={styles.indexRow}>
                <View style={[styles.indexDot, { backgroundColor: tone.ink }]} />
                <View style={[styles.indexLine, { backgroundColor: tone.ink }]} />
              </View>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'stretch',
    borderRadius: theme.radii.medium + 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
  },
  depth: {
    borderRadius: theme.radii.medium + 2,
    bottom: -theme.depth.banner,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  frame: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.depth.banner + theme.spacing.md,
    position: 'relative',
  },
  indexButton: {
    alignItems: 'center',
    borderLeftWidth: 2,
    justifyContent: 'center',
    width: 58,
  },
  indexDot: {
    borderRadius: theme.radii.pill,
    height: 4,
    width: 4,
  },
  indexGlyph: {
    gap: 4,
  },
  indexLine: {
    borderRadius: theme.radii.xs,
    height: 3,
    width: 16,
  },
  indexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  title: {
    lineHeight: 23,
  },
});
