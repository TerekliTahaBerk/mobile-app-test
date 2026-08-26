import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/ui/components/app-button';
import { colors, spacing, typography } from '@/shared/ui/theme/tokens';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>MİLESTONE 1</Text>
          <Text style={styles.title}>Mobil temel hazır</Text>
          <Text style={styles.description}>
            Bu geçici ekran yalnızca uygulamanın açıldığını ve tema değerlerinin çalıştığını doğrular.
          </Text>
        </View>

        <AppButton
          accessibilityHint="İkinci geçici doğrulama ekranını açar"
          label="Yönlendirmeyi dene"
          onPress={() => router.push('/foundation')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  copy: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  eyebrow: {
    color: colors.actionPrimary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 26,
  },
});

