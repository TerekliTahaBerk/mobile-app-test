import { Modal, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { theme } from '@/shared/ui/theme/tokens';

const CONFIRMATION = 'SIFIRLA';

type ResetProgressConfirmSheetProps = {
  confirmation: string;
  isResetting: boolean;
  onCancel: () => void;
  onChangeConfirmation: (value: string) => void;
  onConfirm: () => void;
  visible: boolean;
};

export function ResetProgressConfirmSheet({
  confirmation,
  isResetting,
  onCancel,
  onChangeConfirmation,
  onConfirm,
  visible,
}: ResetProgressConfirmSheetProps) {
  const confirmed = confirmation.trim().toLocaleUpperCase('tr-TR') === CONFIRMATION;

  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.scrim}>
        <View style={styles.sheet} testID="reset-progress-confirm-sheet">
          <View style={styles.grabber} />
          <AppText accessibilityRole="header" align="center" variant="headingM">
            Tüm ilerlemen silinecek
          </AppText>
          <AppText align="center" color="secondary" style={styles.body} variant="prose">
            Profilin, XP’in, İz’in, ders ve tekrar geçmişin, yanlışların ve hatırlatma ayarların
            kalıcı olarak silinir. Bu işlem geri alınamaz.
          </AppText>
          <AppText color="secondary" style={styles.instruction} variant="labelS">
            Onaylamak için SIFIRLA yaz.
          </AppText>
          <TextInput
            accessibilityLabel="Sıfırlama onay metni"
            autoCapitalize="characters"
            editable={!isResetting}
            onChangeText={onChangeConfirmation}
            placeholder={CONFIRMATION}
            placeholderTextColor={theme.colors.text.faint}
            style={styles.input}
            testID="reset-progress-confirmation-input"
            value={confirmation}
          />
          <View style={styles.actions}>
            <AppButton
              disabled={!confirmed || isResetting}
              label={isResetting ? 'Sıfırlanıyor…' : 'İlerlemeyi kalıcı olarak sil'}
              onPress={onConfirm}
              testID="reset-progress-confirm"
              variant="danger"
            />
            <AppButton
              disabled={isResetting}
              label="Vazgeç"
              onPress={onCancel}
              testID="reset-progress-cancel"
              variant="ghost"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { gap: theme.spacing.xs, marginTop: theme.spacing.lg, width: '100%' },
  body: { marginTop: theme.spacing.sm, maxWidth: 340 },
  grabber: {
    backgroundColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    height: 5,
    marginBottom: theme.spacing.lg,
    width: 44,
  },
  input: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.status.dangerBorder,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    color: theme.colors.text.primary,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    width: '100%',
  },
  instruction: { alignSelf: 'flex-start', marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  scrim: { backgroundColor: theme.colors.background.scrim, flex: 1, justifyContent: 'flex-end' },
  sheet: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.sheet,
    borderTopLeftRadius: theme.radii.sheet,
    borderTopRightRadius: theme.radii.sheet,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
});
