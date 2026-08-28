import { Modal, StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type ExitConfirmSheetProps = {
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
};

/** Leaving mid-round loses the round's progress, so it is worth one question. */
export function ExitConfirmSheet({ onCancel, onConfirm, visible }: ExitConfirmSheetProps) {
  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.scrim}>
        <View style={styles.sheet} testID="exit-confirm-sheet">
          <View style={styles.grabber} />
          <Dino size={92} tone="muted" />
          <AppText accessibilityRole="header" align="center" variant="headingM">
            Şimdi çıkarsan bu tur sayılmaz.
          </AppText>
          <AppText align="center" color="secondary" style={styles.body} variant="prose">
            Birkaç soru daha kaldı. Devam edersen seri bugün de korunur.
          </AppText>

          <BottomAction style={styles.actions}>
            <AppButton label="Devam Et" onPress={onCancel} testID="exit-cancel" />
            <AppButton
              label="Çıkışı Onayla"
              onPress={onConfirm}
              testID="exit-confirm"
              variant="ghost"
            />
          </BottomAction>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    paddingHorizontal: 0,
    width: '100%',
  },
  body: {
    maxWidth: 300,
  },
  grabber: {
    backgroundColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    height: 5,
    marginBottom: theme.spacing.lg,
    width: 44,
  },
  scrim: {
    backgroundColor: theme.colors.background.scrim,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.sheet,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
});
