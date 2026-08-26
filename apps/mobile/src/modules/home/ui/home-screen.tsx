import { ScrollView, StyleSheet, View } from 'react-native';

import { homePreviewData } from '@/modules/home/model/home-preview-data';
import { DailyGoalCard } from '@/modules/home/ui/daily-goal-card';
import { HomeHeader } from '@/modules/home/ui/home-header';
import { LearningPathPreview } from '@/modules/home/ui/learning-path-preview';
import { AppButton } from '@/shared/ui/components/app-button';
import { AppText } from '@/shared/ui/components/app-text';
import { Screen } from '@/shared/ui/components/screen';
import { theme } from '@/shared/ui/theme/tokens';

type HomeScreenProps = {
  onStartLesson: () => void;
};

export function HomeScreen({ onStartLesson }: HomeScreenProps) {
  return (
    <Screen testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <HomeHeader
          brandName={homePreviewData.brandName}
          companionName={homePreviewData.companionName}
          greeting={homePreviewData.greeting}
          mode={homePreviewData.mode}
          stats={homePreviewData.stats}
          subtitle={homePreviewData.subtitle}
        />
        <DailyGoalCard goal={homePreviewData.dailyGoal} />
        <LearningPathPreview
          steps={homePreviewData.pathSteps}
          subject={homePreviewData.subject}
          unit={homePreviewData.unit}
        />
      </ScrollView>

      <View style={styles.footer}>
        <AppText color="secondary" variant="bodyS">
          Sıradaki: {homePreviewData.nextStepTitle}
        </AppText>
        <AppButton
          accessibilityHint="Statik ders önizlemesini açar"
          fullWidth
          label="Buradan devam et"
          onPress={onStartLesson}
          testID="home-primary-cta"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  footer: {
    backgroundColor: theme.colors.background.app,
    borderTopColor: theme.colors.border.subtle,
    borderTopWidth: 1,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
});
