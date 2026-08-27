import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { FillBlankExercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { FeedbackPanel, feedbackSurface } from '@/modules/learning/ui/feedback-panel';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { CizgiSpeech } from '@/shared/ui/cizgi/cizgi-speech';
import { theme } from '@/shared/ui/theme/tokens';

const CHIP_HEIGHT = theme.hitTarget + 2;
const ROW_HEIGHT = 64;

/**
 * Design screen 05. Words lift from the bank onto ruled answer lines and drop
 * back when tapped again; the engine decides whether the sentence is right.
 */
export function WordBankExercise({
  evaluation,
  exercise,
  onContinue,
  onSubmit,
}: ExerciseViewProps<FillBlankExercise>) {
  const [answerIds, setAnswerIds] = useState<readonly string[]>([]);

  const checked = evaluation !== null;
  const isCorrect = evaluation?.correct === true;
  const feedback = checked ? (isCorrect ? 'correct' : 'wrong') : null;
  const canCheck = answerIds.length > 0;

  const labelFor = (tokenId: string) =>
    exercise.bank.find((token) => token.id === tokenId)?.label ?? '';

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <AppText accessibilityRole="header" variant="headingM">
          {exercise.title}
        </AppText>

        <CizgiSpeech mood="idle" width={70}>
          <View style={styles.hintRow}>
            <View style={styles.hintChip}>
              <View style={styles.hintPlay} />
            </View>
            <View style={styles.hintUnderline}>
              <AppText color="body" variant="bodyM">
                {exercise.hint}
              </AppText>
            </View>
          </View>
        </CizgiSpeech>

        <View
          accessibilityLabel={
            answerIds.length === 0
              ? 'Cevap satırı boş'
              : `Cevabın: ${answerIds.map(labelFor).join(' ')}`
          }
          accessible
          style={styles.answerArea}
          testID="word-bank-answer"
        >
          {[0, 1, 2].map((line) => (
            <View key={line} style={styles.writingRow} />
          ))}
          <View style={styles.answerWords}>
            {answerIds.map((tokenId) => (
              <WordChip
                disabled={checked}
                key={tokenId}
                label={labelFor(tokenId)}
                onPress={() => setAnswerIds((ids) => ids.filter((id) => id !== tokenId))}
              />
            ))}
          </View>
        </View>

        <View style={styles.bank} testID="word-bank-options">
          {exercise.bank.map((token) => {
            const used = answerIds.includes(token.id);

            return (
              <WordChip
                disabled={used || checked}
                key={token.id}
                label={token.label}
                onPress={() => setAnswerIds((ids) => [...ids, token.id])}
                used={used}
              />
            );
          })}
        </View>
      </ScrollView>

      <BottomAction surfaceColor={feedback ? feedbackSurface[feedback] : undefined}>
        {feedback ? (
          <FeedbackPanel
            detail={isCorrect ? exercise.explanation : (evaluation?.correctAnswerSummary ?? '')}
            kind={feedback}
            title={isCorrect ? 'Harika!' : 'Doğrusu şöyle'}
          />
        ) : null}

        <AppButton
          disabled={!canCheck}
          label={checked ? 'DEVAM ET' : 'KONTROL ET'}
          onPress={() => {
            if (checked) {
              onContinue();
              return;
            }
            onSubmit({ kind: 'fillBlank', tokenIds: answerIds });
          }}
          testID="word-bank-action"
          variant={checked ? (isCorrect ? 'success' : 'danger') : 'primary'}
        />
      </BottomAction>
    </>
  );
}

type WordChipProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  used?: boolean;
};

function WordChip({ disabled = false, label, onPress, used = false }: WordChipProps) {
  return (
    <TactilePressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      depth={0}
      depthColor="transparent"
      disabled={disabled}
      faceStyle={[styles.chipFace, used && styles.chipFaceUsed]}
      onPress={onPress}
      radius={theme.radii.small}
    >
      <AppText color={used ? 'disabled' : 'body'} variant="bodyM">
        {label}
      </AppText>
    </TactilePressable>
  );
}

const styles = StyleSheet.create({
  answerArea: {
    position: 'relative',
  },
  // Chips are CHIP_HEIGHT tall and each writing row is ROW_HEIGHT, so the
  // leading gap plus the row gap land every chip exactly on a rule.
  answerWords: {
    columnGap: theme.spacing.sm + 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    left: 0,
    paddingTop: ROW_HEIGHT - CHIP_HEIGHT,
    position: 'absolute',
    right: 0,
    rowGap: ROW_HEIGHT - CHIP_HEIGHT,
    top: 0,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm + 2,
    justifyContent: 'center',
  },
  chipFace: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorder,
    borderColor: theme.colors.border.strong,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: CHIP_HEIGHT,
    paddingHorizontal: theme.spacing.lg - 1,
  },
  chipFaceUsed: {
    backgroundColor: theme.colors.surface.recessed,
    borderBottomWidth: 2,
    borderColor: theme.colors.action.disabled,
  },
  content: {
    gap: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  hintChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.subject.religion.soft,
    borderRadius: theme.radii.small - 3,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  hintPlay: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 6,
    borderLeftColor: theme.colors.subject.religion.ink,
    borderLeftWidth: 9,
    borderTopColor: 'transparent',
    borderTopWidth: 6,
  },
  hintRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
  },
  // The design underlines the prompt with a dotted rule. iOS only honours
  // `borderStyle` when every side has a width, so this is a solid hairline.
  hintUnderline: {
    borderBottomColor: theme.colors.border.strong,
    borderBottomWidth: 2,
    flex: 1,
    paddingBottom: theme.spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  writingRow: {
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 2,
    height: ROW_HEIGHT,
  },
});
