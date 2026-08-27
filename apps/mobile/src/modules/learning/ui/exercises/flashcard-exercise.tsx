import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { FlashcardPreview } from '@/modules/learning/model/lesson-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { SubjectTag } from '@/shared/ui/components/subject-tag';
import { theme } from '@/shared/ui/theme/tokens';

type FlashcardExerciseProps = {
  /** Owned by the lesson so the HUD can report deck position. */
  cardIndex: number;
  exercise: FlashcardPreview;
  onAdvance: () => void;
  onCardIndexChange: (index: number) => void;
};

/**
 * Design screen 07. Tap the card to turn it over, then say whether you knew
 * it. The self-report is not recorded — review scheduling belongs to the
 * learning system.
 */
export function FlashcardExercise({
  cardIndex,
  exercise,
  onAdvance,
  onCardIndexChange,
}: FlashcardExerciseProps) {
  const [turned, setTurned] = useState(false);

  const card = exercise.cards[cardIndex];
  if (card === undefined) {
    return null;
  }

  const next = () => {
    if (cardIndex + 1 >= exercise.cards.length) {
      onAdvance();
      return;
    }
    setTurned(false);
    onCardIndexChange(cardIndex + 1);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SubjectTag label={exercise.tag} subject={exercise.subject} />

        <Pressable
          accessibilityHint="Kartın diğer yüzünü gösterir"
          accessibilityLabel={
            turned ? `${card.front}. Tanım: ${card.back}. ${card.hint}` : `Kavram: ${card.front}`
          }
          accessibilityRole="button"
          onPress={() => setTurned((value) => !value)}
          testID="flashcard"
        >
          {turned ? <CardBack card={card} /> : <CardFront front={card.front} />}
        </Pressable>
      </ScrollView>

      <BottomAction>
        <View style={styles.verdictRow}>
          <AppButton
            fullWidth={false}
            label="Bilmiyordum"
            onPress={next}
            style={styles.verdictButton}
            testID="flashcard-unknown"
            variant="neutral"
          />
          <AppButton
            fullWidth={false}
            label="Biliyordum"
            onPress={next}
            style={styles.verdictButton}
            testID="flashcard-known"
            variant="success"
          />
        </View>
      </BottomAction>
    </>
  );
}

function CardFront({ front }: { front: string }) {
  return (
    <View style={[styles.card, styles.cardFront]}>
      <AppText align="center" style={styles.frontEyebrow} variant="eyebrow">
        KAVRAM
      </AppText>
      <AppText align="center" variant="headingXXL">
        {front}
      </AppText>
      <AppText align="center" style={styles.frontFooter} variant="bodyS">
        çevirmek için dokun
      </AppText>
    </View>
  );
}

function CardBack({ card }: { card: FlashcardPreview['cards'][number] }) {
  return (
    <View style={[styles.card, styles.cardBack]}>
      <AppText style={styles.backEyebrow} variant="eyebrow">
        TANIM
      </AppText>
      <AppText color="inverse" style={styles.backDefinition} variant="bodyL">
        {card.back}
      </AppText>
      <View style={styles.backDivider} />
      <AppText style={styles.backHint} variant="prose">
        {card.hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  backDefinition: {
    fontSize: 22,
    lineHeight: 32,
  },
  backDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    height: 1,
    marginVertical: theme.spacing.xl,
  },
  backEyebrow: {
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1.9,
    marginBottom: theme.spacing.lg,
  },
  backHint: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  card: {
    borderRadius: theme.radii.xlarge,
    justifyContent: 'center',
    minHeight: 400,
    padding: theme.spacing.xxxl,
  },
  cardBack: {
    backgroundColor: theme.colors.subject.philosophy.primary,
  },
  cardFront: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: theme.depth.cardBorderXL,
    borderColor: theme.colors.subject.philosophy.track,
    borderWidth: 2,
  },
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  frontEyebrow: {
    color: theme.colors.subject.philosophy.dim,
    letterSpacing: 1.9,
    marginBottom: theme.spacing.xxl,
  },
  frontFooter: {
    color: theme.colors.subject.philosophy.dim,
    marginTop: theme.spacing.xxl,
  },
  scroll: {
    flex: 1,
  },
  verdictButton: {
    flex: 1,
  },
  verdictRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
