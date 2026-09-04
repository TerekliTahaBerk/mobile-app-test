import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  initialFor,
  normalizeDisplayName,
  AVATAR_IDS,
  DISPLAY_NAME_MAX_LENGTH,
  type AvatarId,
  type DailyGoal,
  type ReminderTime,
} from '@/modules/learner/domain/learner-profile';
import {
  GOAL_CHOICES,
  REMINDER_CHOICES,
  targetYearChoices,
} from '@/modules/onboarding/model/onboarding-steps';
import type { NotificationPermissionStatus } from '@/shared/notifications/notifications';
import { AppText } from '@/shared/ui/components/app-text';
import { AppButton } from '@/shared/ui/components/app-button';
import { Card } from '@/shared/ui/components/card';
import { BackIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

type ReminderSettingsScreenProps = {
  enabled: boolean;
  avatarId: AvatarId;
  currentYear: number;
  dailyGoal: DailyGoal;
  displayName: string;
  onBack: () => void;
  onChangeTime: (time: ReminderTime) => void;
  onToggle: (enabled: boolean) => void;
  onRequestReset: () => void;
  onSaveProfile: (preferences: ProfilePreferences) => Promise<void> | void;
  permissionStatus: NotificationPermissionStatus;
  showPermissionWarning: boolean;
  time: ReminderTime;
  targetYear: number;
};

export type ProfilePreferences = {
  avatarId: AvatarId;
  dailyGoal: DailyGoal;
  displayName: string;
  targetYear: number;
};

/**
 * Ayarlar. The reminder is the one thing the app schedules on the learner's
 * behalf, so it is also the one thing they must be able to switch off here — an
 * app that only offers "on" during onboarding has not really asked.
 */
export function ReminderSettingsScreen({
  avatarId,
  currentYear,
  dailyGoal,
  displayName,
  enabled,
  onBack,
  onChangeTime,
  onToggle,
  onRequestReset,
  onSaveProfile,
  permissionStatus,
  showPermissionWarning,
  time,
  targetYear,
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
        <ProfilePreferencesCard
          currentYear={currentYear}
          initialValue={{ avatarId, dailyGoal, displayName, targetYear }}
          onSave={onSaveProfile}
        />

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

        {showPermissionWarning && permissionStatus === 'denied' ? (
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
              Telefonun bildirim izni kapalı. Hatırlatmaları kullanmak istersen izni cihaz
              ayarlarından açabilirsin.
            </AppText>
          </Card>
        ) : null}

        <Card style={styles.card} variant="soft">
          <AppText color="accentStrong" variant="labelS">
            Hatırlatmalar cihazından çıkmaz
          </AppText>
          <AppText color="accentSoft" style={styles.detail} variant="proseS">
            Bildirimler bu telefonda planlanır. Hesabın yok ve sunucuya hiçbir şey gönderilmez.
          </AppText>
        </Card>

        <Card style={styles.card} variant="outlined" testID="local-data-disclosure">
          <AppText variant="labelM">Verilerin yalnızca bu cihazda</AppText>
          <AppText color="secondary" style={styles.detail} variant="proseS">
            Cloud yedekleme yoktur. Uygulamayı silersen veya cihazını kaybedersen profilin,
            ilerlemen ve çalışma geçmişin geri getirilemez.
          </AppText>
        </Card>

        <View style={styles.dangerZone}>
          <AppText color="danger" variant="labelM">Verileri sil</AppText>
          <AppText color="secondary" style={styles.detail} variant="proseS">
            Uygulamayı bu cihazda temiz başlangıç durumuna döndürür.
          </AppText>
          <AppButton
            label="İlerlemeyi sıfırla"
            onPress={onRequestReset}
            style={styles.resetButton}
            testID="reset-progress-open"
            variant="neutral"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ProfilePreferencesCard({
  currentYear,
  initialValue,
  onSave,
}: {
  currentYear: number;
  initialValue: ProfilePreferences;
  onSave: (preferences: ProfilePreferences) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const normalizedName = normalizeDisplayName(draft.displayName);
  const years = Array.from(new Set([targetYearChoices(currentYear), [draft.targetYear]].flat())).sort(
    (left, right) => left - right,
  );

  return (
    <Card style={styles.profileCard} testID="profile-preferences">
      <AppText variant="labelM">Profil tercihleri</AppText>
      <AppText color="secondary" style={styles.detail} variant="proseS">
        Bunları değiştirmek çalışma kayıtlarını sıfırlamaz.
      </AppText>

      <AppText color="muted" style={styles.fieldLabel} variant="labelS">GÖRÜNEN AD</AppText>
      <TextInput
        accessibilityLabel="Görünen adın"
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        onChangeText={(value) => setDraft((current) => ({ ...current, displayName: value }))}
        style={styles.nameInput}
        testID="settings-display-name"
        value={draft.displayName}
      />

      <AppText color="muted" style={styles.fieldLabel} variant="labelS">AVATAR</AppText>
      <View style={styles.optionRow}>
        {AVATAR_IDS.map((choice) => (
          <Pressable
            accessibilityLabel={AVATAR_LABELS[choice]}
            accessibilityRole="radio"
            accessibilityState={{ selected: draft.avatarId === choice }}
            key={choice}
            onPress={() => setDraft((current) => ({ ...current, avatarId: choice }))}
            style={[styles.avatar, draft.avatarId === choice ? styles.avatarSelected : null]}
            testID={`settings-avatar-${choice}`}
          >
            {choice === 'initial' ? (
              <AppText color="accentStrong" variant="headingS">{initialFor(draft.displayName)}</AppText>
            ) : choice === 'dino' ? <Dino size={38} /> : null}
          </Pressable>
        ))}
      </View>

      <AppText color="muted" style={styles.fieldLabel} variant="labelS">GÜNLÜK HEDEF</AppText>
      <View style={styles.optionRow}>
        {GOAL_CHOICES.map((choice) => (
          <OptionButton
            key={choice.value}
            label={`${choice.value} tur`}
            onPress={() => setDraft((current) => ({ ...current, dailyGoal: choice.value }))}
            selected={draft.dailyGoal === choice.value}
            testID={`settings-goal-${choice.value}`}
          />
        ))}
      </View>

      <AppText color="muted" style={styles.fieldLabel} variant="labelS">HEDEF YIL</AppText>
      <View style={styles.optionRow}>
        {years.map((year) => (
          <OptionButton
            key={year}
            label={String(year)}
            onPress={() => setDraft((current) => ({ ...current, targetYear: year }))}
            selected={draft.targetYear === year}
            testID={`settings-year-${year}`}
          />
        ))}
      </View>

      <AppButton
        disabled={normalizedName.length === 0 || isSaving}
        label={isSaving ? 'Kaydediliyor' : 'Profili kaydet'}
        onPress={() => {
          setIsSaving(true);
          void Promise.resolve(onSave({ ...draft, displayName: normalizedName })).finally(() =>
            setIsSaving(false),
          );
        }}
        style={styles.saveButton}
        testID="settings-profile-save"
      />
    </Card>
  );
}

function OptionButton({ label, onPress, selected, testID }: { label: string; onPress: () => void; selected: boolean; testID: string }) {
  return (
    <TactilePressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      depth={2}
      depthColor={selected ? theme.colors.action.primaryDepth : theme.colors.border.subtle}
      faceStyle={[styles.optionFace, selected ? styles.optionSelected : null]}
      onPress={onPress}
      style={styles.option}
      testID={testID}
    >
      <AppText color={selected ? 'inverse' : 'primary'} variant="labelS">{label}</AppText>
    </TactilePressable>
  );
}

const AVATAR_LABELS: Record<AvatarId, string> = {
  dino: 'Dino avatarı',
  initial: 'Baş harfin',
  sky: 'Mavi avatar',
  violet: 'Mor avatar',
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarSelected: { borderColor: theme.colors.action.primary, borderWidth: 3 },
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  card: { marginTop: theme.spacing.md, padding: theme.spacing.lg },
  detail: { marginTop: theme.spacing.xs },
  fieldLabel: { marginTop: theme.spacing.lg },
  dangerZone: { marginBottom: theme.spacing.xl, marginTop: theme.spacing.xl },
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
  nameInput: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.medium,
    borderWidth: 2,
    color: theme.colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    minHeight: theme.hitTarget,
    paddingHorizontal: theme.spacing.md,
  },
  option: { flex: 1 },
  optionFace: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    paddingHorizontal: theme.spacing.sm,
  },
  optionRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  optionSelected: { backgroundColor: theme.colors.action.primary, borderColor: theme.colors.action.primary },
  profileCard: { padding: theme.spacing.lg },
  saveButton: { marginTop: theme.spacing.lg },
  scroll: { padding: theme.spacing.xl },
  resetButton: { marginTop: theme.spacing.md },
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
