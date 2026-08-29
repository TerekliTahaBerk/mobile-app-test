import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { ReminderTime } from '@/modules/learner/domain/learner-profile';
import { REMINDER_CHOICES } from '@/modules/onboarding/model/onboarding-steps';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { BackIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type ReminderSettingsScreenProps = {
  enabled: boolean;
  onBack: () => void;
  onChangeTime: (time: ReminderTime) => void;
  onToggle: (enabled: boolean) => void;
  /** False once the learner has refused the system permission. */
  permitted: boolean;
  time: ReminderTime;
};

/**
 * Ayarlar. The reminder is the one thing the app schedules on the learner's
 * behalf, so it is also the one thing they must be able to switch off here — an
 * app that only offers "on" during onboarding has not really asked.
 */
export function ReminderSettingsScreen({
  enabled,
  onBack,
  onChangeTime,
  onToggle,
  permitted,
  time,
}: ReminderSettingsScreenProps) {
  return (
    <Screen background="lesson" testID="settings-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="settings-back"
        >
          <BackIcon color={theme.colors.text.accentStrong} />
        </TactilePressable>
        <AppText accessibilityRole="header" variant="headingS">
          Ayarlar
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: enabled }}
            onPress={() => onToggle(!enabled)}
            style={styles.toggleRow}
            testID="reminder-toggle"
          >
            <View style={styles.toggleText}>
              <AppText variant="labelM">Günlük hatırlatma</AppText>
              <AppText color="secondary" style={styles.detail} variant="proseS">
                Günde bir kez, seçtiğin saatte. O gün çalıştıysan hatırlatma gelmez.
              </AppText>
            </View>
            <View style={[styles.switch, enabled ? styles.switchOn : styles.switchOff]}>
              <View style={[styles.knob, enabled ? styles.knobOn : styles.knobOff]} />
            </View>
          </Pressable>

          {enabled ? (
            <View style={styles.times}>
              {REMINDER_CHOICES.map((choice) => {
                const selected = choice === time;

                return (
                  <TactilePressable
                    accessibilityLabel={choice}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    depth={selected ? 3 : 2}
                    depthColor={
                      selected ? theme.colors.action.primaryDepth : theme.colors.border.subtle
                    }
                    faceStyle={[styles.timeFace, selected ? styles.timeSelected : null]}
                    key={choice}
                    onPress={() => onChangeTime(choice)}
                    testID={`reminder-time-${choice}`}
                  >
                    <AppText color={selected ? 'inverse' : 'primary'} variant="labelS">
                      {choice}
                    </AppText>
                  </TactilePressable>
                );
              })}
            </View>
          ) : null}
        </Card>

        {enabled && !permitted ? (
          <Card
            borderColor={theme.colors.status.dangerBorder}
            style={styles.card}
            surfaceColor={theme.colors.status.dangerSoft}
            testID="reminder-permission-warning"
          >
            <AppText color="danger" variant="labelS">
              Bildirim izni verilmedi
            </AppText>
            <AppText color="secondary" style={styles.detail} variant="proseS">
              Hatırlatma açık görünüyor ama telefonun bildirim izni kapalı olduğu için
              gönderilemiyor. İzni cihaz ayarlarından açabilirsin.
            </AppText>
          </Card>
        ) : null}

        <Card style={styles.card} variant="soft">
          <AppText color="accentStrong" variant="labelS">
            Hatırlatmalar cihazından çıkmaz
          </AppText>
          <AppText color="accentSoft" style={styles.detail} variant="proseS">
            Bildirimler bu telefonda planlanır. Hesabın yok, sunucuya hiçbir şey gönderilmez ve
            ilerlemen yalnızca bu cihazda tutulur.
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  card: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
  detail: { marginTop: theme.spacing.xs },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  knob: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.pill,
    height: 24,
    width: 24,
  },
  knobOff: { marginLeft: 2 },
  knobOn: { marginLeft: 24 },
  scroll: { padding: theme.spacing.xl },
  switch: {
    borderRadius: theme.radii.pill,
    height: 28,
    justifyContent: 'center',
    width: 50,
  },
  switchOff: { backgroundColor: theme.colors.border.subtle },
  switchOn: { backgroundColor: theme.colors.action.primary },
  times: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  timeFace: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  timeSelected: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  toggleRow: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  toggleText: { flex: 1 },
});
