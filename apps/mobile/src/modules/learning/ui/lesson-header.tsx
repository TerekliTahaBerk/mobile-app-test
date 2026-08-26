import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { CloseGlyph, HeartGlyph } from '@/shared/ui/components/glyphs';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { theme } from '@/shared/ui/theme/tokens';

type LessonHeaderProps = {
  /** Omitted on decks that track cards instead of hearts. */
  hearts?: string | undefined;
  /** Replaces the hearts slot, e.g. "3/12" on the flashcard deck. */
  counter?: string | undefined;
  counterColor?: string | undefined;
  fillColor?: string | undefined;
  glyphColor?: string | undefined;
  onClose: () => void;
  progress: number;
  trackColor?: string | undefined;
};

/**
 * The exercise HUD: leave, how far through the lesson you are, and what you
 * have left to spend. It stays identical across every exercise type so the
 * learner's escape route never moves.
 */
export function LessonHeader({
  counter,
  counterColor,
  fillColor,
  glyphColor,
  hearts,
  onClose,
  progress,
  trackColor,
}: LessonHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityHint="Dersten çıkışı onaylamanı ister"
        accessibilityLabel="Dersi kapat"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.closeButton}
        testID="lesson-close"
      >
        <CloseGlyph color={glyphColor} />
      </Pressable>

      <View style={styles.progress}>
        <ProgressBar
          accessibilityLabel="Ders ilerlemesi"
          fillColor={fillColor}
          trackColor={trackColor}
          value={progress}
        />
      </View>

      {hearts === undefined ? null : (
        <View accessible accessibilityLabel={`${hearts} can kaldı`} style={styles.hearts}>
          <HeartGlyph size={20} />
          <AppText color="heart" variant="hud">
            {hearts}
          </AppText>
        </View>
      )}

      {counter === undefined ? null : (
        <AppText accessibilityLabel={`Kart ${counter}`} style={{ color: counterColor }} variant="labelM">
          {counter}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    marginLeft: -theme.spacing.md,
    width: theme.hitTarget,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  hearts: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm - 2,
  },
  progress: {
    flex: 1,
  },
});
