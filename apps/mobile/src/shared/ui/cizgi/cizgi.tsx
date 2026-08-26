import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  cizgiAspectRatios,
  cizgiAssets,
  type CizgiMood,
} from '@/shared/ui/cizgi/cizgi-assets';
import { theme } from '@/shared/ui/theme/tokens';

type CizgiProps = {
  /**
   * Screen-reader label. ÇİZGİ is decorative in most compositions, so the
   * default hides the image; pass a label only where the pose carries meaning.
   */
  accessibilityLabel?: string | undefined;
  /** Draws the design's soft ground ellipse under the character. */
  ground?: boolean;
  mood: CizgiMood;
  style?: StyleProp<ViewStyle>;
  width: number;
};

/**
 * Renders one ÇİZGİ pose at a fixed width, keeping the artwork's own aspect
 * ratio so the character is never stretched.
 */
export function Cizgi({ accessibilityLabel, ground = false, mood, style, width }: CizgiProps) {
  const height = Math.round(width / cizgiAspectRatios[mood]);
  const isDecorative = accessibilityLabel === undefined;

  return (
    <View style={[styles.container, style]}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={accessibilityLabel}
        accessible={!isDecorative}
        importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
        resizeMode="contain"
        source={cizgiAssets[mood]}
        style={{ height, width }}
      />
      {ground ? (
        <View
          importantForAccessibility="no-hide-descendants"
          style={[styles.ground, { width: Math.round(width * 0.72) }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ground: {
    backgroundColor: theme.colors.background.ground,
    borderRadius: theme.radii.pill,
    height: 12,
    marginTop: -6,
  },
});
