import { ScrollView, StyleSheet, View } from 'react-native';

import type {
  MainTopicCard,
  SubtopicCard,
  TopicPerformanceViewModel,
} from '@/modules/profile/model/topic-performance-view-model';
import type {
  TopicPerformanceBand,
  TopicPerformanceWindow,
} from '@/modules/progress/domain/topic-performance';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { BackIcon, CheckIcon, ClockIcon, RepeatIcon, TargetIcon } from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { SegmentedToggle } from '@/shared/ui/components/segmented-toggle';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type TopicPerformanceScreenProps = {
  onBack: () => void;
  onChangeWindow: (window: TopicPerformanceWindow) => void;
  onStartPractice: (topicId: string, beforeAccuracy: number) => void;
  recentResult?: { afterAccuracy: number; beforeAccuracy: number; topicTitle: string } | undefined;
  viewModel: TopicPerformanceViewModel;
};

const SECTIONS: readonly {
  band: TopicPerformanceBand;
  description: string;
  title: string;
}[] = [
  {
    band: 'needsPractice',
    description: 'Yanlışların yoğunlaştığı konular. Bir sonraki tekrarını buradan seç.',
    title: 'Tekrar etmen gerekenler',
  },
  {
    band: 'developing',
    description: 'Henüz yeterli veri yok veya doğruluğun dengede. Çözdükçe netleşecek.',
    title: 'Gelişen konular',
  },
  {
    band: 'strong',
    description: 'Yeterli soruda yüksek doğruluk gösterdiğin konular.',
    title: 'Güçlü olduğun konular',
  },
];

export function TopicPerformanceScreen({
  onBack,
  onChangeWindow,
  onStartPractice,
  recentResult,
  viewModel,
}: TopicPerformanceScreenProps) {
  const { overall } = viewModel;

  return (
    <Screen background="lesson" testID="topic-performance-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="topic-performance-back"
        >
          <BackIcon color={theme.colors.text.accentStrong} />
        </TactilePressable>
        <View style={styles.headerTitle}>
          <AppText accessibilityRole="header" variant="headingS">
            Konu performansın
          </AppText>
          <AppText color="secondary" variant="proseXS">
            Doğru ve yanlışlarına göre canlı görünüm
          </AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SegmentedToggle
          accessibilityLabel="Zaman aralığı"
          onChange={onChangeWindow}
          options={viewModel.windowOptions}
          value={viewModel.window}
        />

        <Card style={styles.hero} variant="soft">
          <View style={styles.heroTop}>
            <View>
              <AppText color="accentStrong" variant="eyebrow">
                GENEL DOĞRULUK
              </AppText>
              <AppText color="accentStrong" variant="display">
                {overall.accuracyLabel}
              </AppText>
              <AppText color="accentSoft" variant="labelS">
                {overall.evidenceLabel}
              </AppText>
            </View>
            <View style={styles.heroIcon}>
              <TargetIcon color={theme.colors.status.successInk} size={28} />
            </View>
          </View>
          <ProgressBar
            accessibilityLabel={`Genel doğruluk ${overall.accuracyLabel}`}
            height={10}
            value={overall.accuracy}
          />
          <AppText color="secondary" style={styles.heroHint} variant="proseS">
            {overall.lowEvidence
              ? 'Bu sonuç için henüz az veri var. Yüzde, arkasındaki soru sayısı kadar güvenilirdir.'
              : 'Her puanlanan cevaptan sonra güncellenir. Konu hâkimiyetinden ayrı, gerçek cevap performansını gösterir.'}
          </AppText>
        </Card>

        {recentResult === undefined ? null : (
          <Card
            borderColor={theme.colors.status.successBorder}
            style={styles.resultBanner}
            surfaceColor={theme.colors.status.successSoft}
          >
            <CheckIcon color={theme.colors.status.successInk} size={22} />
            <View style={styles.resultText}>
              <AppText color="success" variant="labelM">
                Hedefli çalışma tamamlandı
              </AppText>
              <AppText color="accentSoft" variant="proseS">
                {recentResult.topicTitle}: %{Math.round(recentResult.beforeAccuracy * 100)} → %
                {Math.round(recentResult.afterAccuracy * 100)}
              </AppText>
            </View>
          </Card>
        )}

        {viewModel.correctedToday.length === 0 ? null : (
          <View style={styles.section} testID="corrected-today">
            <AppText accessibilityRole="header" variant="headingS">
              Bugün düzelttiğin konular
            </AppText>
            <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
              Daha önce yanlış yaptığın soruları bugün doğru cevapladın.
            </AppText>
            <View style={styles.topicList}>
              {viewModel.correctedToday.map((corrected) => (
                <Card
                  borderColor={theme.colors.status.successBorder}
                  key={corrected.id}
                  style={styles.correctedCard}
                  surfaceColor={theme.colors.status.successSoft}
                  testID={`corrected-today-${corrected.id}`}
                >
                  <CheckIcon color={theme.colors.status.successInk} size={20} />
                  <View style={styles.resultText}>
                    <AppText variant="labelM">{corrected.title}</AppText>
                    <AppText color="secondary" variant="proseXS">
                      {corrected.detail}
                    </AppText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        <View style={styles.metricRow}>
          <MetricCard label="Doğru" tone="success" value={overall.correctAnswers} />
          <MetricCard label="Yanlış" tone="danger" value={overall.wrongAnswers} />
          <MetricCard label="Ana konu" tone="neutral" value={overall.mainTopics} />
        </View>

        {viewModel.emptyReason !== null ? (
          <Card style={styles.empty} testID="topic-performance-empty" variant="outlined">
            <TargetIcon color={theme.colors.text.muted} size={28} />
            <AppText style={styles.emptyTitle} variant="headingXS">
              {viewModel.emptyReason === 'noData'
                ? 'İlk verini oluşturalım'
                : 'Bu aralıkta çözülen soru yok'}
            </AppText>
            <AppText align="center" color="secondary" variant="prose">
              {viewModel.emptyReason === 'noData'
                ? 'Puanlanan bir soru çözdüğünde ana konu ve alt konu performansın burada oluşacak.'
                : 'Daha geniş bir aralık seçebilir veya bugün kısa bir çalışma yapabilirsin.'}
            </AppText>
          </Card>
        ) : (
          SECTIONS.map((section) => {
            const sectionTopics = viewModel.topics.filter((topic) => topic.band === section.band);
            if (sectionTopics.length === 0) {
              return null;
            }
            return (
              <View key={section.band} style={styles.section}>
                <AppText accessibilityRole="header" variant="headingS">
                  {section.title}
                </AppText>
                <AppText color="secondary" style={styles.sectionDescription} variant="proseS">
                  {section.description}
                </AppText>
                <View style={styles.topicList}>
                  {sectionTopics.map((topic) => (
                    <TopicDetailCard
                      key={topic.id}
                      onStartPractice={onStartPractice}
                      topic={topic}
                    />
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

function MetricCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'danger' | 'neutral' | 'success';
  value: number;
}) {
  const color = tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary';
  return (
    <Card style={styles.metricCard} variant="outlined">
      <AppText align="center" color={color} variant="numeric">
        {value}
      </AppText>
      <AppText align="center" color="secondary" variant="caption">
        {label}
      </AppText>
    </Card>
  );
}

/** The trend and freshness line every topic and subtopic carries. */
function ContextLine({ card }: { card: MainTopicCard | SubtopicCard }) {
  return (
    <View style={styles.contextRow}>
      <ClockIcon color={theme.colors.text.muted} size={13} />
      <AppText color="muted" variant="caption">
        {card.lastStudiedLabel}
      </AppText>
      {card.trendLabel === null ? null : (
        <View style={styles.trendBadge}>
          <AppText
            color={card.trend === 'falling' ? 'danger' : card.trend === 'rising' ? 'success' : 'secondary'}
            variant="caption"
          >
            {card.trendLabel}
          </AppText>
        </View>
      )}
    </View>
  );
}

function TopicDetailCard({
  onStartPractice,
  topic,
}: {
  onStartPractice: (topicId: string, beforeAccuracy: number) => void;
  topic: MainTopicCard;
}) {
  const needsPractice = topic.band === 'needsPractice';
  const strong = topic.band === 'strong';
  return (
    <Card
      borderColor={needsPractice ? theme.colors.status.dangerBorder : undefined}
      style={styles.topicCard}
      testID={`topic-performance-${topic.id}`}
      variant="tactile"
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicTitle}>
          <AppText variant="headingXS">{topic.title}</AppText>
          <AppText color="secondary" variant="caption">
            {topic.detail}
          </AppText>
        </View>
        <View
          style={[
            styles.bandBadge,
            needsPractice ? styles.bandDanger : strong ? styles.bandSuccess : styles.bandDeveloping,
          ]}
        >
          {strong ? (
            <CheckIcon color={theme.colors.status.successInk} size={14} />
          ) : needsPractice ? (
            <RepeatIcon color={theme.colors.status.dangerInk} size={14} />
          ) : null}
          <AppText
            color={needsPractice ? 'danger' : strong ? 'success' : 'secondary'}
            variant="caption"
          >
            {topic.statusLabel}
          </AppText>
        </View>
      </View>

      <ContextLine card={topic} />

      <View style={styles.accuracyRow}>
        <AppText color="secondary" variant="caption">
          Ana konu · {topic.evidenceLabel}
        </AppText>
        <AppText variant="labelS">{topic.accuracyLabel} doğruluk</AppText>
      </View>
      <ProgressBar
        accessibilityLabel={`${topic.title}: ${topic.accuracyLabel} doğruluk, ${topic.evidenceLabel}`}
        fillColor={needsPractice ? theme.colors.status.danger : theme.colors.progress.fill}
        height={8}
        value={topic.accuracy}
      />
      <AppText color="muted" style={styles.coverage} variant="caption">
        {topic.coverageLabel}
      </AppText>
      {topic.staleLabel === null ? null : (
        <AppText color="muted" variant="caption">
          {topic.staleLabel}
        </AppText>
      )}

      <View style={styles.subtopicList}>
        <AppText color="muted" variant="eyebrow">
          ALT KONULAR
        </AppText>
        {topic.subtopics.map((subtopic) => (
          <SubtopicRow key={subtopic.id} onStartPractice={onStartPractice} subtopic={subtopic} />
        ))}
      </View>
    </Card>
  );
}

function SubtopicRow({
  onStartPractice,
  subtopic,
}: {
  onStartPractice: (topicId: string, beforeAccuracy: number) => void;
  subtopic: SubtopicCard;
}) {
  const needsPractice = subtopic.band === 'needsPractice';
  return (
    <View style={styles.subtopic}>
      <View style={styles.subtopicTop}>
        <View style={styles.topicTitle}>
          <AppText variant="labelS">{subtopic.title}</AppText>
          <AppText color="secondary" variant="proseXS">
            {subtopic.detail}
          </AppText>
        </View>
        <View style={styles.subtopicScore}>
          <AppText color={needsPractice ? 'danger' : 'primary'} variant="labelS">
            {subtopic.accuracyLabel}
          </AppText>
          <AppText color="muted" variant="mono">
            {subtopic.evidenceLabel}
          </AppText>
        </View>
      </View>
      <ProgressBar
        accessibilityLabel={`${subtopic.title}: ${subtopic.accuracyLabel} doğruluk, ${subtopic.evidenceLabel}`}
        fillColor={needsPractice ? theme.colors.status.danger : theme.colors.progress.fill}
        height={5}
        value={subtopic.accuracy}
      />
      <ContextLine card={subtopic} />
      {subtopic.lowEvidenceNote === null ? null : (
        <AppText color="muted" variant="caption">
          {subtopic.lowEvidenceNote}
        </AppText>
      )}
      {subtopic.attemptSplitLabel === null ? null : (
        <AppText color="secondary" variant="caption">
          {subtopic.attemptSplitLabel}
        </AppText>
      )}
      {subtopic.staleLabel === null ? null : (
        <AppText color="muted" variant="caption">
          {subtopic.staleLabel}
        </AppText>
      )}
      {subtopic.nextReviewLabel === null ? null : (
        <AppText color="muted" variant="caption">
          {subtopic.nextReviewLabel}
        </AppText>
      )}
      {subtopic.band === 'strong' && subtopic.staleLabel === null ? null : (
        <AppButton
          label={subtopic.staleLabel === null ? 'Bu konuyu çalış' : 'Bu konuyu tazele'}
          onPress={() => onStartPractice(subtopic.id, subtopic.accuracy)}
          style={styles.practiceButton}
          testID={`practice-topic-${subtopic.id}`}
          variant={needsPractice ? 'primary' : 'neutral'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  bandBadge: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  bandDanger: { backgroundColor: theme.colors.status.dangerSoft },
  bandDeveloping: { backgroundColor: theme.colors.surface.recessed },
  bandSuccess: { backgroundColor: theme.colors.status.successSoft },
  contextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  correctedCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  coverage: { marginTop: theme.spacing.sm },
  empty: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: { marginBottom: theme.spacing.sm, marginTop: theme.spacing.md },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  headerTitle: { flex: 1, paddingRight: theme.spacing.xl },
  hero: { marginTop: theme.spacing.md, padding: theme.spacing.xl },
  heroHint: { marginTop: theme.spacing.md },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.radii.pill,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricCard: { flex: 1, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.lg },
  metricRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md },
  practiceButton: { marginTop: theme.spacing.sm },
  resultBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  resultText: { flex: 1, gap: theme.spacing.xxs },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing.xxl },
  section: { marginTop: theme.spacing.xxl },
  sectionDescription: { marginTop: theme.spacing.xs },
  subtopic: {
    borderTopColor: theme.colors.border.hairline,
    borderTopWidth: 1,
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
  },
  subtopicList: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
  subtopicScore: { alignItems: 'flex-end', gap: theme.spacing.xxs },
  subtopicTop: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  topicCard: { padding: theme.spacing.lg },
  topicHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  topicList: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  topicTitle: { flex: 1, gap: theme.spacing.xxs },
  trendBadge: {
    backgroundColor: theme.colors.surface.recessed,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
});
