import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Dino is the product mascot. The imported design uses a single piece of
 * artwork throughout and varies only its size and saturation, so this
 * component takes a size and a tone rather than a pose.
 *
 * React Native has no CSS `filter`, so the design's `saturate(.85)` and
 * `grayscale(.35)` treatments are approximated with opacity. The character
 * still reads as subdued in the wrong-answer and out-of-hearts moments, which
 * is what those treatments are there to do.
 */
export type DinoTone = 'default' | 'dimmed' | 'muted';

type DinoProps = {
  /**
   * Screen-reader label. Dino is decorative in most compositions, so the
   * default hides the image; pass a label only where the mascot carries
   * meaning on its own.
   */
  accessibilityLabel?: string | undefined;
  size: number;
  style?: StyleProp<ViewStyle>;
  tone?: DinoTone;
};

/**
 * The mascot artwork. See `assets/dino/README.md`: what ships today is a
 * placeholder, because the approved artwork is larger than the design MCP will
 * return in one response. Replacing the file is the whole change.
 */
const dinoArtwork = require('@/assets/dino/dino.png');

export function Dino({ accessibilityLabel, size, style, tone = 'default' }: DinoProps) {
  const isDecorative = accessibilityLabel === undefined;

  return (
    <View style={[styles.container, style]}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={accessibilityLabel}
        accessible={!isDecorative}
        importantForAccessibility={isDecorative ? 'no-hide-descendants' : 'yes'}
        resizeMode="contain"
        source={dinoArtwork}
        style={[{ height: size, width: size }, toneStyles[tone]]}
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
