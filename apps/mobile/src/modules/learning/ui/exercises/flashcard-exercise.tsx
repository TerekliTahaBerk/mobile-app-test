import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { FlashcardExercise as Exercise } from '@/modules/curriculum/domain/content-types';
import type { ExerciseViewProps } from '@/modules/learning/ui/exercise-view';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { theme } from '@/shared/ui/theme/tokens';

type FlashcardExerciseProps = ExerciseViewProps<Exercise> & {
  /** Lifted so the lesson chrome can count cards in its own progress bar. */
  cardIndex: number;
  onAdvanceCard: () => void;
};

/**
 * The recall deck, on the dark stage. Self-report is evidence, not a verdict:
 * both answers advance the card, and neither costs a heart.
 */
export function FlashcardExercise({
  cardIndex,
  exercise,
  onAdvanceCard,
  onSubmit,
}: FlashcardExerciseProps) {
  const [flipped, setFlipped] = useState(false);
  const card = exercise.cards[cardIndex];

  if (card === undefined) {
    return null;
  }

  const isLast = cardIndex >= exercise.cards.length - 1;
  const answer = (selfReport: 'known' | 'unknown') => {
    setFlipped(false);
    if (isLast) {
      onSubmit({ kind: 'flashcard', selfReport });
    } else {
      onAdvanceCard();
    }
  };

  return (
    <>
      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <AppText color="inverse" variant="caption">
            {exercise.tag}
          </AppText>
        </View>
      </View>

      <View style={styles.stage}>
        <Pressable
          accessibilityHint="Kartı çevirmek için dokun"
          accessibilityLabel={flipped ? `${card.front}. ${card.back}` : card.front}
          accessibilityRole="button"
          onPress={() => setFlipped((value) => !value)}
          style={styles.card}
          testID="flashcard"
        >
          <AppText align="center" color="muted" style={styles.face} variant="eyebrow">
            {flipped ? 'ARKA YÜZ' : 'ÖN YÜZ'}
          </AppText>
          <AppText align="center" color="accentStrong" style={styles.term} variant="headingXXL">
            {card.front.toLocaleUpperCase('tr-TR')}
          </AppText>
          <View style={styles.rule} />
          <AppText align="center" variant="bodyL">
            {flipped ? card.back : card.hint}
          </AppText>
          <AppText align="center" color="muted" style={styles.flipHint} variant="proseS">
            Çevirmek için dokun
          </AppText>
        </Pressable>

        <View style={styles.dots}>
          {exercise.cards.map((deckCard, index) => (
            <View
              key={deckCard.id}
              style={[styles.dot, index === cardIndex ? styles.dotActive : null]}
            />
          ))}
        </View>
      </View>

      <BottomAction style={styles.actions}>
        <View style={styles.actionRow}>
          <AppButton
            label="Tekrar Et"
            onPress={() => answer('unknown')}
            style={styles.action}
            testID="flashcard-unknown"
            variant="ghost"
          />
          <AppButton
            label="Biliyorum"
            onPress={() => answer('known')}
            style={styles.action}
            testID="flashcard-known"
          />
        </View>
      </BottomAction>
    </>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
  },
  actions: {
    paddingTop: theme.spacing.lg + 4,
  },
  card: {
    ...theme.elevation.flashcard,
    backgroundColor: theme.colors.surface.default,
    borderRadius: 28,
    paddingHorizontal: theme.spacing.xxl + 2,
    paddingVertical: theme.spacing.huge,
  },
  dot: {
    backgroundColor: theme.colors.progress.trackOnDark,
    borderRadius: theme.radii.pill,
    height: 9,
    width: 9,
  },
  dotActive: {
    backgroundColor: theme.colors.progress.fillOnDark,
    width: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: theme.spacing.sm + 2,
    justifyContent: 'center',
    marginTop: theme.spacing.lg + 4,
  },
  face: {
    letterSpacing: 1.3,
  },
  flipHint: {
    marginTop: theme.spacing.xl,
  },
  rule: {
    alignSelf: 'center',
    backgroundColor: theme.colors.surface.soft,
    borderRadius: theme.radii.pill,
    height: 3,
    marginVertical: theme.spacing.lg + 4,
    width: 44,
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  tag: {
    backgroundColor: theme.colors.surface.onDark,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md + 2,
    paddingVertical: 7,
  },
  tagRow: {
    alignItems: 'center',
    paddingTop: theme.spacing.xs + 2,
  },
  term: {
    marginTop: theme.spacing.lg + 2,
  },
});
