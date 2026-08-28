import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Dino } from '@/shared/ui/dino/dino';
import { Pop } from '@/shared/ui/motion/motion';
import { theme } from '@/shared/ui/theme/tokens';

type FeedbackSheetProps = {
  correct: boolean;
  /** The right answer, shown only when the learner missed. */
  correctAnswerSummary: string;
  /** Why that is the answer. Always shown, so a miss always teaches. */
  explanation: string;
  onContinue: () => void;
  /** Awarded XP, shown only on a correct answer. */
  xpAwarded: number | null;
};

/**
 * The verdict. It rises from the bottom over the question the learner just
 * answered, keeps Dino's reaction and the reason in the same block, and puts
 * the only way forward under the thumb.
 */
export function FeedbackSheet({
  correct,
  correctAnswerSummary,
  explanation,
  onContinue,
  xpAwarded,
}: FeedbackSheetProps) {
  return (
    <Pop
      style={[styles.sheet, correct ? styles.sheetCorrect : styles.sheetWrong]}
      testID="feedback-sheet"
    >
      <View style={styles.row}>
        <Dino size={correct ? 60 : 58} tone={correct ? 'default' : 'muted'} />
        <View style={styles.copy}>
          <AppText
            accessibilityRole="header"
            color={correct ? 'success' : 'danger'}
            variant="headingM"
          >
            {correct ? 'Doğru!' : 'Olmadı.'}
          </AppText>
          {correct ? (
            <AppText color="accentSoft" style={styles.detail} variant="proseS">
              {explanation}
            </AppText>
          ) : (
            <AppText color="dangerDeep" style={styles.detail} variant="proseS">
              Doğru cevap: {correctAnswerSummary}
            </AppText>
          )}
        </View>
        {correct && xpAwarded !== null ? (
          <View style={styles.xpPill}>
            <AppText color="success" variant="labelS">
              +{xpAwarded} XP
            </AppText>
          </View>
        ) : null}
      </View>

      {correct ? null : (
        <View style={styles.explanation}>
          <AppText color="dangerDeep" variant="proseS">
            {explanation}
          </AppText>
        </View>
      )}

      <AppButton
        label={correct ? 'Devam' : 'Devam Et'}
        onPress={onContinue}
        testID="feedback-continue"
        variant={correct ? 'primary' : 'danger'}
      />
    </Pop>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
  },
  detail: {
    marginTop: 3,
  },
  explanation: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.medium,
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg + 1,
    paddingVertical: theme.spacing.md + 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
    marginBottom: theme.spacing.lg + 2,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg + 4,
  },
  sheetCorrect: {
    backgroundColor: theme.colors.status.successSoft,
  },
  sheetWrong: {
    backgroundColor: theme.colors.status.dangerSoft,
  },
  xpPill: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: 9,
  },
});
