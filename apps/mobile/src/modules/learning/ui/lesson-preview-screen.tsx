import { ScrollView, StyleSheet, View } from 'react-native';

import { lessonPreviewData } from '@/modules/learning/model/lesson-preview-data';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Card } from '@/shared/ui/components/card';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { Screen } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type LessonPreviewScreenProps = {
  onBack: () => void;
};

export function LessonPreviewScreen({ onBack }: LessonPreviewScreenProps) {
  return (
    <Screen testID="lesson-preview-screen">
      <View style={styles.hud}>
        <AppButton
          accessibilityHint="Öğrenme yoluna döner"
          label="Kapat"
          onPress={onBack}
          variant="ghost"
        />
        <View style={styles.hudProgress}>
          <ProgressBar accessibilityLabel="Ders önizleme ilerlemesi" value={lessonPreviewData.progress} />
        </View>
        <AppText color="secondary" variant="labelM">
          {lessonPreviewData.progressLabel}
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.contextRow}>
          <View style={styles.subjectPill}>
            <AppText color="inverse" variant="caption">
              {lessonPreviewData.subject}
            </AppText>
          </View>
          <AppText color="secondary" variant="bodyS">
            {lessonPreviewData.topic}
          </AppText>
        </View>

        <View style={styles.questionBlock}>
          <AppText color="muted" variant="caption">
            ÖNİZLEME SORUSU
          </AppText>
          <AppText accessibilityRole="header" variant="headingXL">
            {lessonPreviewData.question}
          </AppText>
        </View>

        <View accessibilityLabel="Yanıt seçenekleri, statik önizleme" style={styles.optionList}>
          {lessonPreviewData.options.map((option) => (
            <View
              accessible
              accessibilityLabel={`Seçenek ${option.marker}: ${option.label}`}
              key={option.id}
              style={styles.optionFrame}
            >
              <View style={styles.optionShadow} />
              <Card style={styles.optionFace} variant="outlined">
                <View style={styles.optionMarker}>
                  <AppText color="accent" variant="labelM">
                    {option.marker}
                  </AppText>
                </View>
                <AppText style={styles.optionLabel} variant="bodyM">
                  {option.label}
                </AppText>
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppText align="center" color="muted" variant="bodyS">
          {lessonPreviewData.helperText}
        </AppText>
        <AppButton disabled fullWidth label="Kontrol Et" onPress={() => undefined} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  contextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  footer: {
    backgroundColor: theme.colors.background.app,
    borderTopColor: theme.colors.border.subtle,
    borderTopWidth: 1,
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  hud: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  hudProgress: {
    flex: 1,
  },
  optionFace: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 68,
    padding: theme.spacing.md,
    position: 'relative',
  },
  optionFrame: {
    minHeight: 72,
    paddingBottom: theme.spacing.xs,
    position: 'relative',
  },
  optionLabel: {
    flex: 1,
  },
  optionList: {
    gap: theme.spacing.md,
  },
  optionMarker: {
    alignItems: 'center',
    backgroundColor: theme.colors.action.primarySoft,
    borderRadius: theme.radii.small,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  optionShadow: {
    backgroundColor: theme.colors.subject.history.dark,
    borderRadius: theme.radii.large,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 4,
  },
  questionBlock: {
    gap: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
    marginTop: theme.spacing.xl,
  },
  subjectPill: {
    backgroundColor: theme.colors.subject.history.primary,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
