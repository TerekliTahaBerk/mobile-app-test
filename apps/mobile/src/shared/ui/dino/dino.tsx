import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Dino is the product mascot. Context chooses one of three approved poses;
 * size and tone remain presentation concerns owned by each composition.
 *
 * React Native has no CSS `filter`, so the design's `saturate(.85)` and
 * `grayscale(.35)` treatments are approximated with opacity. The character
 * still reads as subdued in the wrong-answer and out-of-hearts moments, which
 * is what those treatments are there to do.
 */
export type DinoTone = 'default' | 'dimmed' | 'muted';
export type DinoPose = 'default' | 'graduation' | 'writing';

type DinoProps = {
  /**
   * Screen-reader label. Dino is decorative in most compositions, so the
   * default hides the image; pass a label only where the mascot carries
   * meaning on its own.
   */
  accessibilityLabel?: string | undefined;
  pose?: DinoPose;
  size: number;
  style?: StyleProp<ViewStyle>;
  tone?: DinoTone;
};

/**
 * Static requires keep every pose discoverable by Metro and the native bundle.
 */
const dinoArtwork: Record<DinoPose, number> = {
  default: require('@/assets/dino/dino.png'),
  graduation: require('@/assets/dino/dino-graduation.png'),
  writing: require('@/assets/dino/dino-writing.png'),
};

export function Dino({
  accessibilityLabel,
  pose = 'default',
  size,
  style,
  tone = 'default',
}: DinoProps) {
  const isDecorative = accessibilityLabel === undefined;

  return (
    <View style={[styles.container, style]}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={accessibilityLabel}
        accessible={!isDecorative}
        importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
        resizeMode="contain"
        source={dinoArtwork[pose]}
        style={[{ height: size, width: size }, toneStyles[tone]]}
        testID={`dino-${pose}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

const toneStyles = StyleSheet.create({
  default: { opacity: 1 },
  dimmed: { opacity: 0.62 },
  muted: { opacity: 0.85 },
});
