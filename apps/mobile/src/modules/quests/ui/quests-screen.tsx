import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  questsPreviewData,
  type QuestIcon,
  type QuestPreview,
} from '@/modules/quests/model/quests-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { Card } from '@/shared/ui/components/card';
import { CloseGlyph, GemGlyph } from '@/shared/ui/components/glyphs';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { theme } from '@/shared/ui/theme/tokens';

type QuestsScreenProps = {
  onClaim: () => void;
  onClose: () => void;
};

/**
 * Design screen 11. Today's short goals, each with visible numeric progress
 * beside the bar so the state is readable without colour.
 */
export function QuestsScreen({ onClaim, onClose }: QuestsScreenProps) {
  return (
    <Screen includeBottomInset={false} testID="quests-screen">
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Görevleri kapat"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.closeButton}
          testID="quests-close"
        >
          <CloseGlyph />
        </Pressable>

        <View accessible accessibilityLabel={`${questsPreviewData.gems} elmas`} style={styles.gems}>
          <GemGlyph />
          <AppText color="gem" variant="hud">
            {questsPreviewData.gems}
          </AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <AppText
          accessibilityRole="header"
          align="center"
          style={styles.heading}
          variant="headingL"
        >
          {questsPreviewData.heading}
        </AppText>

        {questsPreviewData.quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}

        <Card
          accessibilityLabel={`${questsPreviewData.event.title}. ${questsPreviewData.event.remaining}. ${questsPreviewData.event.progressLabel}`}
          accessible
          style={styles.eventCard}
          surfaceColor={theme.colors.event.surface}
        >
          <View style={styles.eventIcon}>
            <View style={styles.eventIconCore} />
          </View>
          <View style={styles.eventCopy}>
            <AppText style={styles.eventTitle} variant="bodyM">
              {questsPreviewData.event.title}
            </AppText>
            <AppText style={styles.eventMeta} variant="bodyS">
              {questsPreviewData.event.remaining}
            </AppText>
          </View>
          <AppText style={styles.eventTitle} variant="labelM">
            {questsPreviewData.event.progressLabel}
          </AppText>
        </Card>
      </ScrollView>

      <BottomAction>
        <AppButton label={questsPreviewData.cta} onPress={onClaim} testID="quests-claim" />
      </BottomAction>
    </Screen>
  );
}

function QuestCard({ quest }: { quest: QuestPreview }) {
  const tone = theme.colors.subject[quest.tone];

  return (
    <Card
      borderColor={quest.claimed ? tone.primary : theme.colors.border.hairline}
      style={styles.questCard}
      surfaceColor={quest.claimed ? tone.soft : theme.colors.surface.default}
    >
      <View style={styles.questHeader}>
        <View style={[styles.questIcon, { backgroundColor: questIconSurfaces[quest.icon] }]}>
          <QuestGlyph icon={quest.icon} />
        </View>
        <AppText
          style={[styles.questTitle, quest.claimed && { color: tone.ink }]}
          variant="bodyM"
        >
          {quest.title}
        </AppText>
        <View
          style={[
            styles.questReward,
            { backgroundColor: quest.claimed ? tone.soft : theme.colors.surface.recessed },
          ]}
        >
          <GemGlyph color={quest.claimed ? tone.primary : theme.colors.text.faint} size={15} />
        </View>
      </View>

      <View style={styles.questProgress}>
        <ProgressBar
          accessibilityLabel={`${quest.title} ilerlemesi`}
          trackColor={quest.claimed ? tone.soft : theme.colors.progress.track}
          value={quest.progress}
        />
        <View importantForAccessibility="no-hide-descendants" style={styles.questProgressLabel}>
          <AppText align="center" color={quest.claimed ? 'checkpoint' : 'muted'} variant="caption">
            {quest.progressLabel}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

function QuestGlyph({ icon }: { icon: QuestIcon }) {
  if (icon === 'trace') {
    return <TraceMark size="xs" />;
  }

  if (icon === 'clock') {
    return (
      <View style={[styles.glyphRing, { borderColor: theme.colors.subject.religion.primary }]}>
        <View style={[styles.glyphHand, { backgroundColor: theme.colors.subject.religion.ink }]} />
      </View>
    );
  }

  return (
    <View style={[styles.glyphRing, { borderColor: theme.colors.subject.geography.primary }]}>
      <View style={[styles.glyphCore, { backgroundColor: theme.colors.subject.geography.ink }]} />
    </View>
  );
}

const questIconSurfaces: Record<QuestIcon, string> = {
  clock: theme.colors.subject.religion.soft,
  target: theme.colors.subject.geography.soft,
  trace: theme.colors.trace.surface,
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    marginLeft: -theme.spacing.md,
    width: theme.hitTarget,
  },
  content: {
    gap: theme.spacing.md + 2,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  eventCard: {
    alignItems: 'center',
    borderColor: theme.colors.event.border,
    flexDirection: 'row',
    gap: theme.spacing.md + 2,
  },
  eventCopy: {
    flex: 1,
    gap: theme.spacing.xxs + 1,
  },
  eventIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.event.soft,
    borderRadius: theme.radii.small + 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  eventIconCore: {
    backgroundColor: theme.colors.event.accent,
    borderRadius: theme.radii.pill,
    height: 20,
    width: 20,
  },
  eventMeta: {
    color: theme.colors.event.muted,
  },
  eventTitle: {
    color: theme.colors.event.ink,
  },
  glyphCore: {
    borderRadius: theme.radii.pill,
    height: 6,
    width: 6,
  },
  glyphHand: {
    borderRadius: theme.radii.pill,
    height: 7,
    marginBottom: 4,
    width: 3,
  },
  glyphRing: {
    alignItems: 'center',
    borderRadius: theme.radii.pill,
    borderWidth: 3,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  gems: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm - 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  heading: {
    color: theme.colors.reward.xpDepth,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  questCard: {
    gap: theme.spacing.md,
  },
  questHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md + 1,
  },
  questIcon: {
    alignItems: 'center',
    borderRadius: theme.radii.small - 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  questProgress: {
    justifyContent: 'center',
    position: 'relative',
  },
  questProgressLabel: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questReward: {
    alignItems: 'center',
    borderRadius: theme.radii.small - 3,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  questTitle: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});
