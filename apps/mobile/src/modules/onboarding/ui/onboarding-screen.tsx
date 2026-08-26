import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  onboardingPreviewData,
  type OnboardingOption,
} from '@/modules/onboarding/model/onboarding-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { BackGlyph } from '@/shared/ui/components/glyphs';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { CizgiSpeech } from '@/shared/ui/cizgi/cizgi-speech';
import { theme } from '@/shared/ui/theme/tokens';

type OnboardingScreenProps = {
  onFinish: () => void;
};

/**
 * Design screen 01. Four questions, one choice each, ÇİZGİ asking. Answers are
 * held in local state for the length of the flow and then discarded — there is
 * no account, no placement test, and no persistence yet.
 */
export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});

  const step = onboardingPreviewData.steps[stepIndex];
  if (step === undefined) {
    return null;
  }

  const selectedId = choices[step.id];
  const canContinue = selectedId !== undefined;
  const isLastStep = stepIndex === onboardingPreviewData.steps.length - 1;

  return (
    <Screen includeBottomInset={false} testID="onboarding-screen">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Önceki adım"
          accessibilityRole="button"
          accessibilityState={{ disabled: stepIndex === 0 }}
          disabled={stepIndex === 0}
          onPress={() => setStepIndex((index) => Math.max(0, index - 1))}
          style={styles.backButton}
          testID="onboarding-back"
        >
          <BackGlyph />
        </Pressable>

        <View
          accessible
          accessibilityLabel={`Adım ${stepIndex + 1} / ${onboardingPreviewData.steps.length}`}
          style={styles.stepper}
        >
          {onboardingPreviewData.steps.map((current, index) => (
            <View
              key={current.id}
              style={[styles.stepDash, index <= stepIndex && styles.stepDashDone]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <CizgiSpeech mood={step.mood} width={86}>
          <AppText accessibilityRole="header" color="body" variant="bodyL">
            {step.prompt}
          </AppText>
        </CizgiSpeech>

        <View style={styles.options}>
          {step.options.map((option) => (
            <OnboardingChoice
              key={option.id}
              onPress={() => setChoices((current) => ({ ...current, [step.id]: option.id }))}
              option={option}
              selected={selectedId === option.id}
            />
          ))}
        </View>
      </ScrollView>

      <BottomAction>
        <AppButton
          disabled={!canContinue}
          label={step.cta}
          onPress={() => {
            if (isLastStep) {
              onFinish();
              return;
            }
            setStepIndex((index) => index + 1);
          }}
          testID="onboarding-cta"
        />
      </BottomAction>
    </Screen>
  );
}

type OnboardingChoiceProps = {
  onPress: () => void;
  option: OnboardingOption;
  selected: boolean;
};

function OnboardingChoice({ onPress, option, selected }: OnboardingChoiceProps) {
  return (
    <TactilePressable
      accessibilityLabel={[option.title, option.meta].filter(Boolean).join('. ')}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      depth={0}
      depthColor="transparent"
      faceStyle={[styles.choiceFace, selected && styles.choiceFaceSelected]}
      onPress={onPress}
      testID={`onboarding-option-${option.id}`}
    >
      <View style={styles.choiceRow}>
        {option.badge === undefined ? null : (
          <View style={styles.choiceBadge}>
            <AppText align="center" color="subjectHistory" variant="labelS">
              {option.badge}
            </AppText>
          </View>
        )}

        <View style={styles.choiceCopy}>
          <AppText variant="headingXS">{option.title}</AppText>
          {option.meta === undefined ? null : (
            <AppText color="muted" variant="bodyS">
              {option.meta}
            </AppText>
          )}
        </View>
      </View>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  choiceBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.history.soft,
    borderRadius: theme.radii.small + 1,
    justifyContent: 'center',
    minHeight: 46,
    minWidth: 46,
    paddingHorizontal: theme.spacing.sm,
  },
  choiceCopy: {
    flex: 1,
    gap: theme.spacing.xxs + 1,
  },
  choiceFace: {
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.subtle,
    borderWidth: 2,
    minHeight: theme.hitTarget + 16,
    padding: theme.spacing.lg,
  },
  choiceFaceSelected: {
    backgroundColor: theme.colors.action.primaryTint,
    borderColor: theme.colors.action.primary,
  },
  choiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg - 1,
  },
  content: {
    gap: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  options: {
    gap: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  stepDash: {
    backgroundColor: theme.colors.trace.surface,
    borderRadius: theme.radii.pill,
    flex: 1,
    height: 7,
  },
  stepDashDone: {
    backgroundColor: theme.colors.action.primary,
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.xs + 1,
  },
});
