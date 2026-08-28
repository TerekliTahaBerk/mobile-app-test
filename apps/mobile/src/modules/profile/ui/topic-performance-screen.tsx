import { ScrollView, StyleSheet, View } from 'react-native';

import type {
  ProfileTopicPerformance,
  ProfileViewModel,
} from '@/modules/profile/model/profile-view-model';
import type { TopicPerformanceBand } from '@/modules/progress/domain/topic-performance';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { BackIcon, CheckIcon, RepeatIcon, TargetIcon } from '@/shared/ui/components/icons';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

type TopicPerformanceScreenProps = {
  onBack: () => void;
  onStartPractice: (topicId: string, beforeAccuracy: number) => void;
  recentResult?: { afterAccuracy: number; beforeAccuracy: number; topicTitle: string } | undefined;
  topics: ProfileViewModel['topicPerformance'];
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
  onStartPractice,
  recentResult,
  topics,
}: TopicPerformanceScreenProps) {
  const totals = topics.reduce(
    (summary, topic) => ({
      correct: summary.correct + topic.correctAnswers,
      attempts: summary.attempts + topic.totalAttempts,
      wrong: summary.wrong + topic.wrongAnswers,
    }),
    { attempts: 0, correct: 0, wrong: 0 },
  );
  const accuracy = totals.attempts === 0 ? 0 : totals.correct / totals.attempts;

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
        <Card style={styles.hero} variant="soft">
          <View style={styles.heroTop}>
            <View>
              <AppText color="accentStrong" variant="eyebrow">
                GENEL DOĞRULUK
              </AppText>
              <AppText color="accentStrong" variant="display">
                %{Math.round(accuracy * 100)}
              </AppText>
            </View>
            <View style={styles.heroIcon}>
              <TargetIcon color={theme.colors.status.successInk} size={28} />
            </View>
          </View>
          <ProgressBar
            accessibilityLabel={`Genel doğruluk yüzde ${Math.round(accuracy * 100)}`}
            height={10}
            value={accuracy}
          />
          <AppText color="secondary" style={styles.heroHint} variant="proseS">
            Her puanlanan cevaptan sonra güncellenir. Konu hâkimiyetinden ayrı, gerçek cevap
            performansını gösterir.
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

        <View style={styles.metricRow}>
          <MetricCard label="Doğru" tone="success" value={totals.correct} />
          <MetricCard label="Yanlış" tone="danger" value={totals.wrong} />
          <MetricCard label="Ana konu" tone="neutral" value={topics.length} />
        </View>

        {topics.length === 0 ? (
          <Card style={styles.empty} variant="outlined">
            <TargetIcon color={theme.colors.text.muted} size={28} />
            <AppText style={styles.emptyTitle} variant="headingXS">
              İlk verini oluşturalım
            </AppText>
            <AppText align="center" color="secondary" variant="prose">
              Puanlanan bir soru çözdüğünde ana konu ve alt konu performansın burada oluşacak.
            </AppText>
          </Card>
        ) : (
          SECTIONS.map((section) => {
            const sectionTopics = topics.filter((topic) => topic.band === section.band);
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

function TopicDetailCard({
  onStartPractice,
  topic,
}: {
  onStartPractice: (topicId: string, beforeAccuracy: number) => void;
  topic: ProfileTopicPerformance;
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
            needsPractice
              ? styles.bandDanger
              : strong
                ? styles.bandSuccess
                : styles.bandDeveloping,
          ]}
        >
          {strong ? (
            <CheckIcon color={theme.colors.status.successInk} size={14} />
          ) : needsPractice ? (
            <RepeatIcon color={theme.colors.status.dangerInk} size={14} />
          ) : null}
          <AppText color={needsPractice ? 'danger' : strong ? 'success' : 'secondary'} variant="caption">
            {topic.statusLabel}
          </AppText>
        </View>
      </View>
      <View style={styles.accuracyRow}>
        <AppText color="secondary" variant="caption">
          Ana konu
        </AppText>
        <AppText variant="labelS">{topic.accuracyLabel}</AppText>
      </View>
      <ProgressBar
        accessibilityLabel={`${topic.title}: ${topic.accuracyLabel}`}
        fillColor={needsPractice ? theme.colors.status.danger : theme.colors.progress.fill}
        height={8}
        value={topic.accuracy}
      />

      <View style={styles.subtopicList}>
        <AppText color="muted" variant="eyebrow">
          ALT KONULAR
        </AppText>
        {topic.subtopics.map((subtopic) => (
          <View key={subtopic.id} style={styles.subtopic}>
            <View style={styles.subtopicTop}>
              <View style={styles.topicTitle}>
                <AppText variant="labelS">{subtopic.title}</AppText>
                <AppText color="secondary" variant="proseXS">
                  {subtopic.detail}
                </AppText>
              </View>
              <AppText
                color={subtopic.band === 'needsPractice' ? 'danger' : 'primary'}
                variant="mono"
              >
                {subtopic.accuracyLabel}
              </AppText>
            </View>
            <ProgressBar
              accessibilityLabel={`${subtopic.title}: ${subtopic.accuracyLabel} doğruluk`}
              fillColor={
                subtopic.band === 'needsPractice'
                  ? theme.colors.status.danger
                  : theme.colors.progress.fill
              }
              height={5}
              value={subtopic.accuracy}
            />
            {subtopic.nextReviewLabel === null ? null : (
              <AppText color="muted" variant="caption">
                {subtopic.nextReviewLabel}
              </AppText>
            )}
            {subtopic.band === 'strong' ? null : (
              <AppButton
                label="Bu konuyu çalış"
                onPress={() => onStartPractice(subtopic.id, subtopic.accuracy)}
                style={styles.practiceButton}
                testID={`practice-topic-${subtopic.id}`}
                variant={subtopic.band === 'needsPractice' ? 'primary' : 'neutral'}
              />
            )}
          </View>
        ))}
      </View>
    </Card>
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
  hero: { padding: theme.spacing.xl },
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
  subtopicTop: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md },
  topicCard: { padding: theme.spacing.lg },
  topicHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: theme.spacing.md },
  topicList: { gap: theme.spacing.md, marginTop: theme.spacing.md },
  topicTitle: { flex: 1, gap: theme.spacing.xxs },
});
