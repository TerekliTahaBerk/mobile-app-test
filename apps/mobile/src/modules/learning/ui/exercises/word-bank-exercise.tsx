import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { WordBankPreview } from '@/modules/learning/model/lesson-preview-data';
import { FeedbackPanel, feedbackSurface } from '@/modules/learning/ui/feedback-panel';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { CizgiSpeech } from '@/shared/ui/cizgi/cizgi-speech';
import { theme } from '@/shared/ui/theme/tokens';

type WordBankExerciseProps = {
  exercise: WordBankPreview;
  onAdvance: () => void;
};

const MIN_ANSWER_LENGTH = 3;
const CHIP_HEIGHT = theme.hitTarget + 2;
const ROW_HEIGHT = 64;

/**
 * Design screen 05. Words lift from the bank onto ruled answer lines and drop
 * back when tapped again. The solution list is preview copy, not an evaluation
 * contract.
 */
export function WordBankExercise({ exercise, onAdvance }: WordBankExerciseProps) {
  const [answerIds, setAnswerIds] = useState<readonly string[]>([]);
  const [checked, setChecked] = useState(false);

  const labelFor = (wordId: string) =>
    exercise.bank.find((word) => word.id === wordId)?.label ?? '';

  const isCorrect =
    answerIds.map(labelFor).join(' ') === exercise.solution.join(' ');
  const feedback = checked ? (isCorrect ? 'correct' : 'wrong') : null;
  const canCheck = answerIds.length >= MIN_ANSWER_LENGTH;

  const reset = () => {
    setAnswerIds([]);
    setChecked(false);
  };

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

        <CizgiSpeech mood={exercise.mood} width={70}>
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
            {answerIds.map((wordId) => (
              <WordChip
                disabled={checked}
                key={wordId}
                label={labelFor(wordId)}
                onPress={() => setAnswerIds((ids) => ids.filter((id) => id !== wordId))}
              />
            ))}
          </View>
        </View>

        <View style={styles.bank} testID="word-bank-options">
          {exercise.bank.map((word) => {
            const used = answerIds.includes(word.id);

            return (
              <WordChip
                disabled={used || checked}
                key={word.id}
                label={word.label}
                onPress={() => setAnswerIds((ids) => [...ids, word.id])}
                used={used}
              />
            );
          })}
        </View>
      </ScrollView>

      <BottomAction surfaceColor={feedback ? feedbackSurface[feedback] : undefined}>
        {feedback ? (
          <FeedbackPanel
            detail={exercise.solution.join(' ')}
            kind={feedback}
            title={isCorrect ? 'Harika!' : 'Doğrusu şöyle'}
          />
        ) : null}

        <AppButton
          disabled={!canCheck}
          label={checked ? 'DEVAM ET' : 'KONTROL ET'}
          onPress={() => {
            if (!checked) {
              setChecked(true);
              return;
            }
            reset();
            onAdvance();
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
  writingRow: {
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 2,
    height: ROW_HEIGHT,
  },
  scroll: {
    flex: 1,
  },
});
