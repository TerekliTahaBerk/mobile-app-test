import { ScrollView, StyleSheet, View } from 'react-native';

import type {
  MistakeCard,
  MistakeNotebookViewModel,
} from '@/modules/profile/model/mistake-notebook-view-model';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { BackIcon, CheckIcon, ClockIcon, RepeatIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type MistakeNotebookScreenProps = {
  onBack: () => void;
  onStartPractice: (subtopicId: string) => void;
  viewModel: MistakeNotebookViewModel;
};

/**
 * Yanlış defteri. Everything the learner missed, with what they answered, what
 * was right, and why. There is deliberately no way to delete an entry: a
 * mistake closes by being answered cleanly again, and the note says so.
 */
export function MistakeNotebookScreen({
  onBack,
  onStartPractice,
  viewModel,
}: MistakeNotebookScreenProps) {
  const empty = viewModel.open.length === 0 && viewModel.learned.length === 0;

  return (
    <Screen background="lesson" testID="mistake-notebook-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="mistake-notebook-back"
        >
          <BackIcon color={theme.colors.text.accentStrong} />
        </TactilePressable>
        <View style={styles.headerTitle}>
          <AppText accessibilityRole="header" variant="headingS">
            Yanlış defterin
          </AppText>
          <AppText color="secondary" variant="proseXS">
            {viewModel.headline}
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.note} variant="soft">
          <AppText color="accentSoft" variant="proseS">
            {viewModel.note}
          </AppText>
        </Card>

        {empty ? (
          <Card style={styles.empty} testID="mistake-notebook-empty" variant="outlined">
            <CheckIcon color={theme.colors.text.muted} size={28} />
            <AppText style={styles.emptyTitle} variant="headingXS">
              Defterin şimdilik boş
            </AppText>
            <AppText align="center" color="secondary" variant="prose">
              Bir soruyu yanlış yaptığında, verdiğin cevap ve doğrusu burada birikir.
            </AppText>
          </Card>
        ) : null}

        <Section
          cards={viewModel.open}
          description="Bu kazanımlarda temiz bir tekrar cevabı verdiğinde kapanacaklar."
          onStartPractice={onStartPractice}
          title="Çalışılacak yanlışlar"
        />
        <Section
          cards={viewModel.learned}
          description="Aynı kazanımı tekrar doğru cevaplayarak kapattığın yanlışlar."
          onStartPractice={onStartPractice}
          title="Artık öğrendiklerin"
        />
      </ScrollView>
    </Screen>
  );
}

function Section({
  cards,
  description,
  onStartPractice,
  title,
}: {
  cards: readonly MistakeCard[];
  description: string;
  onStartPractice: (subtopicId: string) => void;
  title: string;
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText accessibilityRole="header" variant="headingS">
        {title}
      </AppText>
      <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
        {description}
      </AppText>
      <View style={styles.cardList}>
        {cards.map((card) => (
          <MistakeDetailCard card={card} key={card.id} onStartPractice={onStartPractice} />
        ))}
      </View>
    </View>
  );
}

function MistakeDetailCard({
  card,
  onStartPractice,
}: {
  card: MistakeCard;
  onStartPractice: (subtopicId: string) => void;
}) {
  return (
    <Card
      borderColor={card.learned ? theme.colors.status.successBorder : theme.colors.status.dangerBorder}
      style={styles.mistakeCard}
      testID={`mistake-${card.id}`}
      variant="outlined"
    >
      <View style={styles.cardHeader}>
        <AppText color="muted" style={styles.taxonomy} variant="caption">
          {card.taxonomyLabel}
        </AppText>
        <View style={[styles.statusBadge, card.learned ? styles.statusLearned : styles.statusOpen]}>
          {card.learned ? (
            <CheckIcon color={theme.colors.status.successInk} size={13} />
          ) : (
            <RepeatIcon color={theme.colors.status.dangerInk} size={13} />
          )}
          <AppText color={card.learned ? 'success' : 'danger'} variant="caption">
            {card.statusLabel}
          </AppText>
        </View>
      </View>

      <AppText style={styles.prompt} variant="labelM">
        {card.prompt}
      </AppText>

      {card.givenAnswer === null ? null : (
        <AnswerRow label="Senin cevabın" tone="danger" value={card.givenAnswer} />
      )}
      <AnswerRow label="Doğru cevap" tone="success" value={card.correctAnswer} />

      <AppText color="secondary" style={styles.explanation} variant="proseS">
        {card.explanation}
      </AppText>

      <View style={styles.metaRow}>
        <ClockIcon color={theme.colors.text.muted} size={13} />
        <AppText color="muted" variant="caption">
          {card.wrongCountLabel}
        </AppText>
        <AppText color="muted" variant="caption">
          ·
        </AppText>
        <AppText color="muted" variant="caption">
          {card.lastSeenLabel ?? card.openedLabel}
        </AppText>
      </View>
      <AppText color="muted" variant="caption">
        {card.skillTitle}
      </AppText>

      <AppButton
        label="Benzer soru çöz"
        onPress={() => onStartPractice(card.subtopicId)}
        style={styles.practiceButton}
        testID={`mistake-practice-${card.id}`}
        variant={card.learned ? 'neutral' : 'primary'}
      />
    </Card>
  );
}

function AnswerRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'danger' | 'success';
  value: string;
}) {
  return (
    <View
      style={[styles.answerRow, tone === 'danger' ? styles.answerWrong : styles.answerRight]}
      testID={`answer-${tone}`}
    >
      <AppText color={tone === 'danger' ? 'danger' : 'success'} variant="caption">
        {label}
      </AppText>
      <AppText style={styles.answerValue} variant="proseS">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  answerRight: {
    backgroundColor: theme.colors.status.successSoft,
    borderColor: theme.colors.status.successBorder,
  },
  answerRow: {
    borderRadius: theme.radii.medium,
    borderWidth: 1,
    gap: theme.spacing.xxs,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  answerValue: { marginTop: 1 },
  answerWrong: {
    backgroundColor: theme.colors.status.dangerSoft,
    borderColor: theme.colors.status.dangerBorder,
  },
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  cardList: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  empty: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: { marginBottom: theme.spacing.sm, marginTop: theme.spacing.md },
  explanation: { marginTop: theme.spacing.md },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: { flex: 1, paddingRight: theme.spacing.xl },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  mistakeCard: { padding: theme.spacing.lg },
  note: { marginTop: theme.spacing.md },
  practiceButton: { marginTop: theme.spacing.md },
  prompt: { marginTop: theme.spacing.md },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  section: { marginTop: theme.spacing.xxl },
  sectionDescription: { marginTop: theme.spacing.xs },
  statusBadge: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  statusLearned: { backgroundColor: theme.colors.status.successSoft },
  statusOpen: { backgroundColor: theme.colors.status.dangerSoft },
  taxonomy: { flex: 1 },
});
