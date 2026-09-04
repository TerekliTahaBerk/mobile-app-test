import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import {
  completeOnboarding,
  initialFor,
  normalizeDisplayName,
  AVATAR_IDS,
  DISPLAY_NAME_MAX_LENGTH,
  type AvatarId,
  type LearnerProfile,
  type OnboardingDraft,
} from '@/modules/learner/domain/learner-profile';
import {
  applicableSteps,
  canAdvance,
  isSkippable,
  GOAL_CHOICES,
  GRADE_CHOICES,
  REFERRAL_CHOICES,
  REMINDER_CHOICES,
  START_CHOICES,
  TRACK_CHOICES,
  targetYearChoices,
  type OnboardingStepId,
} from '@/modules/onboarding/model/onboarding-steps';
import { ChoiceRow } from '@/modules/onboarding/ui/choice-row';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { BackIcon, BellIcon, HeartIcon, StarIcon, StreakIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { StepProgress } from '@/shared/ui/components/step-progress';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { Dino } from '@/shared/ui/dino/dino';
import { DinoSpeech } from '@/shared/ui/dino/dino-speech';
import { theme } from '@/shared/ui/theme/tokens';
import { trackEvent } from '@/shared/observability/observability';
import type { NotificationPermissionStatus } from '@/shared/notifications/notifications';

type OnboardingScreenProps = {
  /** Injected so the year choices do not depend on a clock inside the view. */
  currentYear: number;
  onFinish: (profile: LearnerProfile) => Promise<void> | void;
  /** Called only when the learner explicitly turns reminders on. */
  onRequestReminderPermission?: () => Promise<NotificationPermissionStatus>;
  /** There is no account system yet; the sign-in affordance is not offered. */
  onSignIn?: (() => void) | undefined;
  /** Keeps the unsupported LGS choice available only in design previews. */
  showLgsOption?: boolean;
};

type Stage = { kind: 'question'; index: number } | { kind: 'summary' } | { kind: 'welcome' };

/**
 * Onboarding. One question per screen, every answer a single tap, and no
 * account form anywhere — the learner is studying within a minute of opening
 * the app, and the answers only shape what they see first.
 */
export function OnboardingScreen({ currentYear, onFinish, onRequestReminderPermission, onSignIn, showLgsOption = true }: OnboardingScreenProps) {
  const [draft, setDraft] = useState<OnboardingDraft>({ remindersEnabled: false });
  const [reminderPermissionDenied, setReminderPermissionDenied] = useState(false);
  const [finishError, setFinishError] = useState<Error | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [stage, setStage] = useState<Stage>({ kind: 'welcome' });

  const steps = useMemo(() => applicableSteps(draft), [draft]);
  const patch = (next: Partial<OnboardingDraft>) =>
    setDraft((current) => ({ ...current, ...next }));
  const toggleReminders = () => {
    if (draft.remindersEnabled === true) {
      patch({ remindersEnabled: false });
      return;
    }

    setReminderPermissionDenied(false);
    void (onRequestReminderPermission?.() ?? Promise.resolve('granted'))
      .then((status) => {
        const granted = status === 'granted';
        patch({ remindersEnabled: granted });
        setReminderPermissionDenied(!granted);
      })
      .catch(() => setReminderPermissionDenied(true));
  };

  if (stage.kind === 'welcome') {
    return (
      <Screen background="celebration" includeBottomInset={false} testID="onboarding-welcome">
        <View style={styles.welcomeStage}>
          <Dino size={196} />
          <AppText
            accessibilityRole="header"
            align="center"
            color="inverse"
            style={styles.welcomeTitle}
            variant="headingXXL"
          >
            Soru çöz, seriyi{'\n'}bozma.
          </AppText>
          <AppText align="center" color="onDark" style={styles.welcomeBody} variant="prose">
            TYT Sosyal Bilimler konuları kısa turlar halinde. Günde 5 dakika yeter.
          </AppText>
        </View>
        <BottomAction>
          <AppButton
            label="Başla"
            onPress={() => {
              trackEvent('onboarding_started', {});
              setStage({ index: 0, kind: 'question' });
            }}
            testID="onboarding-start"
            variant="inverse"
          />
          {onSignIn === undefined ? null : (
            <AppButton label="Hesabım var" onPress={onSignIn} variant="ghost" />
          )}
        </BottomAction>
      </Screen>
    );
  }

  if (stage.kind === 'summary') {
    const name = normalizeDisplayName(draft.displayName ?? '');

    return (
      <Screen includeBottomInset={false} testID="onboarding-summary">
        <View style={styles.railRow}>
          <StepProgress
            accessibilityLabel="Onboarding tamamlandı"
            currentStep={steps.length}
            totalSteps={steps.length}
          />
        </View>
        <View style={styles.welcomeStage}>
          <Dino pose="graduation" size={180} />
          <AppText accessibilityRole="header" align="center" style={styles.summaryTitle} variant="headingXXL">
            Hazırsın, {name}.
          </AppText>
          <AppText align="center" color="secondary" style={styles.summaryDetail} variant="prose">
            {summaryLine(draft, currentYear)}
          </AppText>
          <View style={styles.summaryChips}>
            <View style={[styles.summaryChip, styles.summaryChipStreak]}>
              <View style={styles.summaryChipRow}>
                <StreakIcon />
                <AppText color="streak" variant="headingXS">
                  0
                </AppText>
              </View>
              <AppText align="center" color="streak" style={styles.summaryChipLabel} variant="caption">
                Seri bugün başlar
              </AppText>
            </View>
            <View style={[styles.summaryChip, styles.summaryChipHearts]}>
              <View style={styles.summaryChipRow}>
                <HeartIcon />
                <AppText color="heart" variant="headingXS">
                  5
                </AppText>
              </View>
              <AppText align="center" color="heart" style={styles.summaryChipLabel} variant="caption">
                Can hazır
              </AppText>
            </View>
          </View>
        </View>
        <BottomAction>
          {finishError === null ? null : (
            <AppText align="center" color="danger" testID="onboarding-save-error" variant="proseS">
              Profilin kaydedilemedi. Bağlantı gerekmiyor; tekrar deneyebilirsin.
            </AppText>
          )}
          <AppButton
            disabled={isFinishing}
            label={isFinishing ? 'Kaydediliyor' : finishError === null ? 'Başla' : 'Tekrar dene'}
            onPress={() => {
              setFinishError(null);
              setIsFinishing(true);
              Promise.resolve(onFinish(completeOnboarding(draft, new Date().toISOString())))
                .catch((cause: unknown) => {
                  setFinishError(cause instanceof Error ? cause : new Error(String(cause)));
                })
                .finally(() => setIsFinishing(false));
            }}
            testID="onboarding-finish"
          />
        </BottomAction>
      </Screen>
    );
  }

  const step = steps[stage.index];
  if (step === undefined) {
    return null;
  }

  const goBack = () =>
    stage.index === 0
      ? setStage({ kind: 'welcome' })
      : setStage({ index: stage.index - 1, kind: 'question' });

  const goNext = () =>
    stage.index >= steps.length - 1
      ? setStage({ kind: 'summary' })
      : setStage({ index: stage.index + 1, kind: 'question' });

  return (
    <Screen includeBottomInset={false} testID={`onboarding-${step}`}>
      <View style={styles.railRow}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={goBack}
          testID="onboarding-back"
        >
          <BackIcon />
        </TactilePressable>
        <StepProgress
          accessibilityLabel={`Adım ${stage.index + 1} / ${steps.length}`}
          currentStep={stage.index + 1}
          totalSteps={steps.length}
        />
      </View>

      <ScrollView contentContainerStyle={styles.questionBody} showsVerticalScrollIndicator={false}>
        <StepQuestion
          currentYear={currentYear}
          draft={draft}
          onPatch={patch}
          onToggleReminders={toggleReminders}
          reminderPermissionDenied={reminderPermissionDenied}
          showLgsOption={showLgsOption}
          step={step}
        />
      </ScrollView>

      <BottomAction>
        <AppButton
          disabled={!canAdvance(step, draft)}
          label="Devam"
          onPress={goNext}
          testID="onboarding-next"
        />
        {isSkippable(step) ? (
          <AppButton
            label={step === 'start' ? 'Şimdi değil, atla' : 'Atla'}
            onPress={goNext}
            testID="onboarding-skip"
            variant="ghost"
          />
        ) : null}
      </BottomAction>
    </Screen>
  );
}

type StepQuestionProps = {
  currentYear: number;
  draft: OnboardingDraft;
  onPatch: (next: Partial<OnboardingDraft>) => void;
  onToggleReminders: () => void;
  reminderPermissionDenied: boolean;
  showLgsOption: boolean;
  step: OnboardingStepId;
};

function StepQuestion({ currentYear, draft, onPatch, onToggleReminders, reminderPermissionDenied, showLgsOption, step }: StepQuestionProps) {
  switch (step) {
    case 'exam':
      return (
        <>
          <DinoSpeech size={76}>
            <AppText accessibilityRole="header" color="success" variant="headingM">
              Hangi sınava hazırlanıyorsun?
            </AppText>
          </DinoSpeech>
          <View style={styles.choices}>
            <ChoiceRow
              badge={<AppText color="success" variant="labelS">YKS</AppText>}
              detail="Pilot: TYT Sosyal Bilimler"
              label="YKS"
              onPress={() => onPatch({ exam: 'yks' })}
              selected={draft.exam === 'yks'}
              testID="onboarding-exam-yks"
            />
            {showLgsOption ? (
              <ChoiceRow
                badge={<AppText color="secondary" variant="labelS">LGS</AppText>}
                detail="Bu pilotta henüz yok"
                disabled
                label="LGS"
                onPress={() => undefined}
                selected={draft.exam === 'lgs'}
                testID="onboarding-exam-lgs"
              />
            ) : null}
          </View>
        </>
      );

    case 'track':
      return (
        <>
          <DinoSpeech size={76}>
            <AppText accessibilityRole="header" color="success" variant="headingM">
              Hangi bölümdesin?
            </AppText>
            <AppText color="accentSoft" style={styles.bubbleDetail} variant="proseS">
              Derslerini buna göre sıralayacağım.
            </AppText>
          </DinoSpeech>
          <View style={styles.choices}>
            {TRACK_CHOICES.map((choice) => (
              <ChoiceRow
                detail={choice.detail}
                key={choice.value}
                label={choice.label}
                onPress={() => onPatch({ track: choice.value })}
                selected={draft.track === choice.value}
                testID={`onboarding-track-${choice.value}`}
              />
            ))}
          </View>
        </>
      );

    case 'grade':
      return (
        <>
          <DinoSpeech>
            <AppText accessibilityRole="header" color="success" variant="headingS">
              Kaçıncı sınıftasın?
            </AppText>
            <AppText color="accentSoft" style={styles.bubbleDetail} variant="proseS">
              Hedef yılına göre konuları sıralayacağım.
            </AppText>
          </DinoSpeech>
          <View style={styles.grid}>
            {GRADE_CHOICES.map((choice, index) => (
              <PillChoice
                key={choice.value}
                label={choice.label}
                onPress={() => onPatch({ grade: choice.value })}
                selected={draft.grade === choice.value}
                style={index === GRADE_CHOICES.length - 1 ? styles.gridFull : styles.gridHalf}
                testID={`onboarding-grade-${choice.value}`}
              />
            ))}
          </View>
          <AppText color="muted" style={styles.subLabel} variant="labelS">
            HEDEF SINAV
          </AppText>
          <View style={styles.yearRow}>
            {targetYearChoices(currentYear).map((year) => (
              <PillChoice
                detail="Haziran"
                key={year}
                label={String(year)}
                onPress={() => onPatch({ targetYear: year })}
                selected={draft.targetYear === year}
                style={styles.yearChoice}
                testID={`onboarding-year-${year}`}
              />
            ))}
          </View>
        </>
      );

    case 'identity':
      return (
        <>
          <DinoSpeech>
            <AppText accessibilityRole="header" color="success" variant="headingS">
              Sana nasıl hitap edeyim?
            </AppText>
          </DinoSpeech>
          <View style={styles.nameField}>
            <TextInput
              accessibilityLabel="Görünen adın"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              onChangeText={(value) => onPatch({ displayName: value })}
              placeholder="Adın"
              placeholderTextColor={theme.colors.text.faint}
              style={styles.nameInput}
              testID="onboarding-name"
              value={draft.displayName ?? ''}
            />
            <AppText color="muted" variant="proseXS">
              {(draft.displayName ?? '').length} / {DISPLAY_NAME_MAX_LENGTH}
            </AppText>
          </View>
          {showLgsOption ? (
            <AppText color="muted" style={styles.fieldHint} variant="proseXS">
              Lig sıralamasında bu isim görünür.
            </AppText>
          ) : null}

          <AppText color="muted" style={styles.subLabel} variant="labelS">
            AVATAR
          </AppText>
          <View style={styles.avatarRow}>
            {AVATAR_IDS.map((avatarId) => (
              <AvatarChoice
                avatarId={avatarId}
                displayName={draft.displayName ?? ''}
                key={avatarId}
                onPress={() => onPatch({ avatarId })}
                selected={(draft.avatarId ?? 'initial') === avatarId}
              />
            ))}
          </View>
        </>
      );

    case 'referral':
      return (
        <>
          <DinoSpeech>
            <AppText accessibilityRole="header" color="success" variant="headingS">
              Bizi nereden duydun?
            </AppText>
            <AppText color="accentSoft" style={styles.bubbleDetail} variant="proseS">
              Tek dokunuş, sonra geçiyoruz.
            </AppText>
          </DinoSpeech>
          <View style={styles.choices}>
            {REFERRAL_CHOICES.map((choice) => (
              <ChoiceRow
                key={choice.value}
                label={choice.label}
                onPress={() => onPatch({ referralSource: choice.value })}
                selected={draft.referralSource === choice.value}
                testID={`onboarding-referral-${choice.value}`}
              />
            ))}
          </View>
        </>
      );

    case 'start':
      return (
        <>
          <DinoSpeech>
            <AppText accessibilityRole="header" color="success" variant="headingS">
              Nereden başlayalım?
            </AppText>
            <AppText color="accentSoft" style={styles.bubbleDetail} variant="proseS">
              Kısa bir turla konu haritanı çıkarayım.
            </AppText>
          </DinoSpeech>
          <View style={styles.choices}>
            {START_CHOICES.map((choice) => (
              <ChoiceRow
                detail={choice.detail}
                key={choice.value}
                label={choice.label}
                onPress={() => onPatch({ startingPoint: choice.value })}
                selected={draft.startingPoint === choice.value}
                testID={`onboarding-start-${choice.value}`}
              />
            ))}
          </View>
          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <StarIcon size={18} />
            </View>
            <AppText style={styles.noteText} variant="bodyS">
              Tespit turunda can harcamazsın.
            </AppText>
          </View>
        </>
      );

    case 'goal':
      return (
        <>
          <DinoSpeech>
            <AppText accessibilityRole="header" color="success" variant="headingS">
              Günde kaç tur?
            </AppText>
            <AppText color="accentSoft" style={styles.bubbleDetail} variant="proseS">
              Seriyi korumak için bir tur yeter.
            </AppText>
          </DinoSpeech>
          <View style={styles.choices}>
            {GOAL_CHOICES.map((choice) => (
              <ChoiceRow
                badge={
                  <AppText
                    color={draft.dailyGoal === choice.value ? 'success' : 'secondary'}
                    variant="headingXS"
                  >
                    {choice.value}
                  </AppText>
                }
                detail={choice.detail}
                key={choice.value}
                label={choice.label}
                onPress={() => onPatch({ dailyGoal: choice.value })}
                selected={draft.dailyGoal === choice.value}
                tag={choice.popular ? 'POPÜLER' : undefined}
                testID={`onboarding-goal-${choice.value}`}
              />
            ))}
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderRow}>
              <View style={styles.reminderIcon}>
                <BellIcon />
              </View>
              <View style={styles.reminderBody}>
                <AppText variant="bodyM">Seriyi hatırlat</AppText>
                <AppText color="secondary" style={styles.reminderDetail} variant="proseXS">
                  Günde bir kez, sessiz
                </AppText>
              </View>
              <Pressable
                accessibilityLabel="Seri hatırlatması"
                accessibilityRole="switch"
                accessibilityState={{ checked: draft.remindersEnabled === true }}
                onPress={onToggleReminders}
                style={[
                  styles.switch,
                  draft.remindersEnabled === true ? styles.switchOn : styles.switchOff,
                ]}
                testID="onboarding-reminder-switch"
              >
                <View style={styles.switchKnob} />
              </Pressable>
            </View>

            {draft.remindersEnabled === true ? (
              <View style={styles.reminderTimes}>
                {REMINDER_CHOICES.map((time) => (
                  <PillChoice
                    compact
                    key={time}
                    label={time}
                    onPress={() => onPatch({ reminderTime: time })}
                    selected={draft.reminderTime === time}
                    style={styles.reminderTime}
                    testID={`onboarding-reminder-${time}`}
                  />
                ))}
              </View>
            ) : null}
            {reminderPermissionDenied ? (
              <AppText color="danger" style={styles.reminderDetail} testID="onboarding-reminder-denied" variant="proseXS">
                Bildirim izni verilmedi. Sorun değil; hatırlatmaları daha sonra Ayarlar’dan açabilirsin.
              </AppText>
            ) : null}
          </View>
        </>
      );
  }
}

function PillChoice({
  compact = false,
  detail,
  label,
  onPress,
  selected,
  style,
  testID,
}: {
  compact?: boolean;
  detail?: string | undefined;
  label: string;
  onPress: () => void;
  selected: boolean;
  style?: object;
  testID?: string | undefined;
}) {
  return (
    <TactilePressable
      accessibilityLabel={detail === undefined ? label : `${label} ${detail}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      depth={compact ? 0 : theme.depth.cardBorder}
      depthColor={selected ? theme.colors.action.primary : theme.colors.border.subtle}
      onPress={onPress}
      style={style}
      testID={testID}
    >
      <View style={[styles.pill, compact ? styles.pillCompact : null, selected ? styles.pillSelected : null]}>
        <AppText align="center" color={selected ? 'success' : 'primary'} variant={compact ? 'labelS' : 'bodyL'}>
          {label}
        </AppText>
        {detail === undefined ? null : (
          <AppText align="center" color={selected ? 'accentSoft' : 'secondary'} variant="proseXS">
            {detail}
          </AppText>
        )}
      </View>
    </TactilePressable>
  );
}

function AvatarChoice({
  avatarId,
  displayName,
  onPress,
  selected,
}: {
  avatarId: AvatarId;
  displayName: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={AVATAR_LABELS[avatarId]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.avatar,
        { backgroundColor: AVATAR_SURFACES[avatarId] },
        selected ? styles.avatarSelected : styles.avatarResting,
      ]}
      testID={`onboarding-avatar-${avatarId}`}
    >
      {avatarId === 'initial' ? (
        <AppText color="accentStrong" variant="headingM">
          {initialFor(displayName)}
        </AppText>
      ) : avatarId === 'dino' ? (
        <Dino size={44} />
      ) : null}
    </Pressable>
  );
}

const AVATAR_LABELS: Record<AvatarId, string> = {
  dino: 'Dino avatarı',
  initial: 'Baş harfin',
  sky: 'Mavi avatar',
  violet: 'Mor avatar',
};

const AVATAR_SURFACES: Record<AvatarId, string> = {
  dino: theme.colors.subject.history.soft,
  initial: theme.colors.surface.soft,
  sky: theme.colors.subject.physics.soft,
  violet: theme.colors.subject.chemistry.soft,
};

function summaryLine(draft: OnboardingDraft, currentYear: number): string {
  const exam = draft.exam === 'lgs' ? 'LGS' : 'YKS';
  const track =
    draft.track === undefined
      ? null
      : TRACK_CHOICES.find((choice) => choice.value === draft.track)?.label ?? null;
  const year = draft.targetYear ?? currentYear + 1;
  const goal = draft.dailyGoal ?? 3;

  return [exam, track, String(year), `günde ${goal} tur`].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  avatarResting: {
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
  },
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    marginTop: theme.spacing.md + 1,
  },
  avatarSelected: {
    borderColor: theme.colors.action.primary,
    borderWidth: 3,
  },
  backFace: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.hitTarget,
    minWidth: theme.hitTarget - 14,
  },
  bubbleDetail: {
    marginTop: theme.spacing.xs + 2,
  },
  choices: {
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xxxl,
  },
  fieldHint: {
    marginTop: 9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl + 2,
  },
  gridFull: {
    width: '100%',
  },
  gridHalf: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  nameField: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.action.primary,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl + 2,
    paddingHorizontal: theme.spacing.lg + 4,
    paddingVertical: theme.spacing.lg + 3,
  },
  nameInput: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    padding: 0,
  },
  note: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.history.soft,
    borderRadius: theme.radii.large,
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg + 1,
  },
  noteIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.small,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  noteText: {
    color: theme.colors.subject.history.deep,
    flex: 1,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    gap: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg + 4,
  },
  pillCompact: {
    borderRadius: theme.radii.small + 2,
    paddingVertical: theme.spacing.md + 1,
  },
  pillSelected: {
    backgroundColor: theme.colors.surface.soft,
    borderColor: theme.colors.action.primary,
  },
  questionBody: {
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  railRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  reminderBody: {
    flex: 1,
  },
  reminderCard: {
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large + 2,
    borderWidth: 1,
    marginTop: theme.spacing.xxl,
    padding: theme.spacing.lg + 2,
  },
  reminderDetail: {
    marginTop: 1,
  },
  reminderIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.reward.streakSoft,
    borderRadius: theme.radii.small,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  reminderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
  },
  reminderTime: {
    flex: 1,
  },
  reminderTimes: {
    flexDirection: 'row',
    gap: 9,
    marginTop: theme.spacing.lg,
  },
  subLabel: {
    letterSpacing: 0.8,
    marginTop: theme.spacing.xxxl,
  },
  summaryChip: {
    borderRadius: theme.radii.medium,
    paddingHorizontal: theme.spacing.lg + 2,
    paddingVertical: theme.spacing.lg,
  },
  summaryChipHearts: {
    backgroundColor: theme.colors.reward.heartSoft,
  },
  summaryChipLabel: {
    marginTop: 3,
  },
  summaryChipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
  },
  summaryChipStreak: {
    backgroundColor: theme.colors.reward.streakSoft,
  },
  summaryChips: {
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    marginTop: theme.spacing.xxxl,
  },
  summaryDetail: {
    marginTop: theme.spacing.sm + 2,
  },
  summaryTitle: {
    marginTop: theme.spacing.sm + 2,
  },
  switch: {
    borderRadius: theme.radii.pill,
    height: 30,
    justifyContent: 'center',
    padding: 3,
    width: 50,
  },
  switchKnob: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.pill,
    height: 24,
    width: 24,
  },
  switchOff: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.border.strong,
  },
  switchOn: {
    alignItems: 'flex-end',
    backgroundColor: theme.colors.action.primary,
  },
  welcomeBody: {
    marginTop: theme.spacing.lg,
    maxWidth: 280,
  },
  welcomeStage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  welcomeTitle: {
    marginTop: theme.spacing.lg,
  },
  yearChoice: {
    flex: 1,
  },
  yearRow: {
    flexDirection: 'row',
    gap: theme.spacing.md - 1,
    marginTop: theme.spacing.md + 1,
  },
});
