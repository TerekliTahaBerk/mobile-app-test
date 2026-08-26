import { Modal, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LessonPreviewViewModel } from '@/modules/learning/model/lesson-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { theme } from '@/shared/ui/theme/tokens';

type ExitConfirmSheetProps = {
  exit: LessonPreviewViewModel['exit'];
  onConfirm: () => void;
  onStay: () => void;
  visible: boolean;
};

/**
 * Design screen 08. The sheet states what leaving costs without scolding: the
 * loud action keeps the learner in the lesson, and leaving stays one quiet tap
 * away.
 */
export function ExitConfirmSheet({ exit, onConfirm, onStay, visible }: ExitConfirmSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onStay}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.scrim}>
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.spacing.xxl) }]}
          testID="exit-confirm-sheet"
        >
          <View style={styles.headingRow}>
            <Cizgi mood={exit.mood} width={96} />
            <View style={styles.headingCopy}>
              <TraceMark size="md" />
              <AppText accessibilityRole="header" variant="headingL">
                {exit.heading}
              </AppText>
            </View>
          </View>

          <AppText color="secondary" variant="prose">
            {exit.body}
          </AppText>

          <View style={styles.actions}>
            <AppButton label={exit.stayLabel} onPress={onStay} testID="exit-stay" />
            <AppButton
              label={exit.confirmLabel}
              onPress={onConfirm}
              testID="exit-confirm"
              variant="ghost"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: theme.spacing.md,
  },
  headingCopy: {
    flex: 1,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
  },
  scrim: {
    backgroundColor: theme.colors.background.scrim,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface.sheet,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    gap: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
  },
});
