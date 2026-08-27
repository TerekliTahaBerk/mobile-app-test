import { Pressable, StyleSheet, View } from 'react-native';

import { getContentIndex } from '@/modules/curriculum/content/content-source';
import type { LessonId } from '@/modules/curriculum/domain/content-types';
import { lessonPreviewData } from '@/modules/learning/model/lesson-preview-data';
import { APP_MODE } from '@/shared/config/app-config';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { BottomAction } from '@/shared/ui/components/bottom-action';
import { BackGlyph } from '@/shared/ui/components/glyphs';
import { Screen } from '@/shared/ui/components/screen';
import { TraceMark } from '@/shared/ui/components/trace-mark';
import { Cizgi } from '@/shared/ui/cizgi/cizgi';
import { Bob } from '@/shared/ui/motion/motion';
import { theme } from '@/shared/ui/theme/tokens';

type LessonIntroScreenProps = {
  lessonId: LessonId;
  onBack: () => void;
  onContinue: () => void;
};

/**
 * Design screen 02. A held beat before the drill starts: ÇİZGİ names the real
 * lesson that is about to open.
 *
 * The İz line stays preview copy — there is no İz calculation yet.
 */
export function LessonIntroScreen({ lessonId, onBack, onContinue }: LessonIntroScreenProps) {
  const index = getContentIndex();
  const lesson = index.getLesson(lessonId);
  const topic = index.getTopic(lesson.topicId);
  const unit = index.getUnit(topic.unitId);
  const traceNote =
    APP_MODE === 'productionPilot'
      ? 'Bu dersi tamamlamak bugünün İz’ine yazılır.'
      : lessonPreviewData.intro.traceNote;

  return (
    <Screen includeBottomInset={false} testID="lesson-intro-screen">
      <Pressable
        accessibilityLabel="Yola dön"
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}
        testID="lesson-intro-back"
      >
        <BackGlyph />
      </Pressable>

      <View style={styles.stage}>
        <View style={styles.bubble}>
          <AppText accessibilityRole="header" align="center" color="body" variant="bodyL">
            {`Hazır mısın? ${unit.title} · ${lesson.title}`}
          </AppText>
          <View importantForAccessibility="no-hide-descendants" style={styles.bubbleTail} />
        </View>

        <Bob duration={3000}>
          <Cizgi mood="pose" width={196} />
        </Bob>

        <View accessible accessibilityLabel={traceNote} style={styles.traceBlock}>
          <TraceMark size="md" />
          <AppText color="muted" variant="bodyS">
            {traceNote}
          </AppText>
        </View>
      </View>

      <BottomAction>
        <AppButton
          label={lessonPreviewData.intro.cta}
          onPress={onContinue}
          testID="lesson-intro-cta"
        />
      </BottomAction>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
    width: theme.hitTarget,
  },
  bubble: {
    backgroundColor: theme.colors.surface.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radii.large,
    borderWidth: 2,
    marginBottom: theme.spacing.xxl + 6,
    maxWidth: 308,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg + 2,
  },
  bubbleTail: {
    backgroundColor: theme.colors.surface.default,
    borderBottomWidth: 2,
    borderColor: theme.colors.border.subtle,
    borderRightWidth: 2,
    bottom: -9,
    height: 15,
    left: '50%',
    marginLeft: -8,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 15,
  },
  stage: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },
  traceBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl + 2,
  },
});
