import { ScrollView, StyleSheet, View } from 'react-native';

import { SUPPORT_SECTIONS } from '@/modules/legal/content/support';
import { AppText } from '@/shared/ui/components/app-text';
import { BackIcon } from '@/shared/ui/components/icons';
import { Screen } from '@/shared/ui/components/screen';
import { TactilePressable } from '@/shared/ui/components/tactile-pressable';
import { theme } from '@/shared/ui/theme/tokens';

export function SupportScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen background="lesson" testID="support-screen">
      <View style={styles.header}>
        <TactilePressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          depth={0}
          depthColor="transparent"
          faceStyle={styles.backFace}
          onPress={onBack}
          testID="support-back"
        >
          <BackIcon color={theme.colors.text.accentStrong} />
        </TactilePressable>
        <AppText accessibilityRole="header" variant="headingS">
          Tekrarla Destek
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText color="secondary" variant="proseS">
          Sık karşılaşılan durumlar ve iletişim bilgileri
        </AppText>
        {SUPPORT_SECTIONS.map((section) => (
          <View key={section.heading} style={styles.section}>
            <AppText accessibilityRole="header" variant="headingXS">
              {section.heading}
            </AppText>
            <AppText color="secondary" style={styles.body} variant="prose">
              {section.body}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backFace: {
    alignItems: 'center',
    height: theme.hitTarget,
    justifyContent: 'center',
    width: theme.hitTarget,
  },
  body: { marginTop: theme.spacing.sm },
  header: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border.hairline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 64,
    paddingHorizontal: theme.spacing.md,
  },
  scroll: { padding: theme.spacing.xl },
  section: { marginTop: theme.spacing.xl },
});
