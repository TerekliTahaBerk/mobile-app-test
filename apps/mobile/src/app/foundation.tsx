import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/shared/ui/components/app-button';
import { colors, spacing, typography } from '@/shared/ui/theme/tokens';

export default function FoundationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>Yönlendirme çalışıyor</Text>
          <Text style={styles.description}>
            Bu ekran ürün arayüzü değildir; Expo Router yapılandırması için geçici bir doğrulamadır.
          </Text>
        </View>

        <AppButton label="Geri dön" onPress={() => router.back()} />
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

