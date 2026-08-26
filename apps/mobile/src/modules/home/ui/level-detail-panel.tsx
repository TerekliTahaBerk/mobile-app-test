import { StyleSheet, View } from 'react-native';

import type { CurrentLevelPreview } from '@/modules/home/model/home-preview-data';
import { AppText } from '@/shared/ui/components/app-text';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type LevelDetailPanelProps = {
  level: CurrentLevelPreview;
  onStart: () => void;
};

/**
 * The coral information panel that opens under the selected level: what the
 * lesson is, where it sits in the unit, and the single obvious next action.
 */
export function LevelDetailPanel({ level, onStart }: LevelDetailPanelProps) {
  return (
    <View style={styles.frame} testID="level-detail-panel">
      <View importantForAccessibility="no-hide-descendants" style={styles.arrow} />
      <View style={styles.depth} />
      <View style={styles.panel}>
        <View accessible style={styles.copy}>
          <AppText color="inverse" variant="headingS">
            {level.title}
          </AppText>
          <AppText style={styles.meta} variant="bodyS">
            {level.meta}
          </AppText>
        </View>

        <TactilePressable
          accessibilityHint="Ders ekranını açar"
          accessibilityLabel={`${level.title} dersine başla`}
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.ctaFace}
          onPress={onStart}
          radius={theme.radii.small + 1}
          testID="level-detail-cta"
        >
          <AppText align="center" color="accent" variant="labelM">
            {level.cta}
          </AppText>
        </TactilePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: 3,
    height: 18,
    left: '50%',
    marginLeft: -9,
    position: 'absolute',
    top: -9,
    transform: [{ rotate: '45deg' }],
    width: 18,
    zIndex: 1,
  },
  copy: {
    gap: theme.spacing.xs + 1,
  },
  ctaFace: {
    backgroundColor: theme.colors.surface.default,
    justifyContent: 'center',
    minHeight: theme.hitTarget + 4,
    paddingVertical: theme.spacing.lg,
  },
  depth: {
    backgroundColor: theme.colors.action.primaryDepth,
    borderRadius: theme.radii.large,
    bottom: -theme.depth.panel,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  frame: {
    marginBottom: theme.depth.panel,
    marginTop: theme.spacing.lg,
    position: 'relative',
    width: '100%',
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  panel: {
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radii.large,
    gap: theme.spacing.md + 2,
    padding: theme.spacing.lg + 2,
  },
});
