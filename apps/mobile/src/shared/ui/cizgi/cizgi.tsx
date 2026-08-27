import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  cizgiAspectRatios,
  cizgiAssets,
  type CizgiMood,
} from '@/shared/ui/cizgi/cizgi-assets';

type CizgiSizeProps =
  | { height: number; width?: never }
  | { height?: never; width: number };

type CizgiProps = CizgiSizeProps & {
  /**
   * Screen-reader label. ÇİZGİ is decorative in most compositions, so the
   * default hides the image; pass a label only where the pose carries meaning.
   */
  accessibilityLabel?: string | undefined;
  mood: CizgiMood;
  style?: StyleProp<ViewStyle>;
};

/**
 * Renders one ÇİZGİ pose at a fixed width *or* a fixed height, deriving the
 * other axis from the artwork's own ratio so the character is never stretched.
 * Size by height inside a fixed-height band; size by width everywhere else.
 *
 * The design draws a separate ground ellipse under the character; the artwork
 * shipped here already carries its own contact shadow, so adding a second one
 * only cuts across the shoes.
 */
export function Cizgi({ accessibilityLabel, height, mood, style, width }: CizgiProps) {
  const ratio = cizgiAspectRatios[mood];
  const resolvedWidth = width ?? Math.round((height ?? 0) * ratio);
  const resolvedHeight = height ?? Math.round((width ?? 0) / ratio);
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
        style={{ height: resolvedHeight, width: resolvedWidth }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
