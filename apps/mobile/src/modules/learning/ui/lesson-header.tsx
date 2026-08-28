import { StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/ui/components/app-text';
import { CloseIcon, HeartIcon } from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type LessonHeaderProps = {
  /** `null` hides the counter — the flashcard deck counts cards instead. */
  hearts: number | null;
  onExit: () => void;
  /** Shown in place of the heart count on the flashcard stage. */
  counter?: string | undefined;
  onDark?: boolean;
  progress: number;
};

/**
 * The persistent exercise chrome: a way out, how far this round has come, and
 * what a mistake will cost. Nothing else competes with the question.
 */
export function LessonHeader({
  counter,
  hearts,
  onDark = false,
  onExit,
  progress,
}: LessonHeaderProps) {
  const heartsDepleted = hearts !== null && hearts <= 0;

  return (
    <View style={styles.header}>
      <TactilePressable
        accessibilityLabel="Çalışmadan çık"
        accessibilityRole="button"
        depth={0}
        depthColor="transparent"
        faceStyle={styles.exitFace}
        onPress={onExit}
        testID="lesson-exit"
      >
        <CloseIcon color={onDark ? theme.colors.text.onDarkFaint : theme.colors.text.muted} />
      </TactilePressable>

      <View style={styles.meter}>
        <ProgressBar
          accessibilityLabel="Çalışma ilerlemesi"
          fillColor={onDark ? theme.colors.progress.fillOnDark : theme.colors.progress.fill}
          height={12}
          trackColor={onDark ? theme.colors.progress.trackOnDark : theme.colors.progress.track}
          value={progress}
        />
      </View>

      {counter !== undefined ? (
        <AppText color={onDark ? 'onDark' : 'secondary'} variant="bodyS">
          {counter}
        </AppText>
      ) : hearts === null ? (
        <View accessibilityLabel="Sınırsız can" accessibilityRole="text" style={styles.counter}>
          <HeartIcon size={20} />
          <AppText color="heart" variant="labelM">
            ∞
          </AppText>
        </View>
      ) : (
        <View
          accessibilityLabel={`${hearts} can`}
          accessibilityRole="text"
          style={[styles.counter, heartsDepleted ? styles.counterEmpty : null]}
        >
          <HeartIcon size={20} />
          <AppText color="heart" variant="labelM">
            {hearts}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  counter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  counterEmpty: {
    backgroundColor: theme.colors.reward.heartSoft,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md - 1,
    paddingVertical: 5,
  },
  exitFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    minWidth: theme.hitTarget - 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingBottom: 16,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  meter: {
    flex: 1,
  },
});
