import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/shared/ui/theme/tokens';
import { AppTypographyProvider } from '@/shared/ui/theme/typography-provider';

export default function RootLayout() {
  return (
    <AppTypographyProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background.app },
          headerShown: false,
        }}
      />
      <StatusBar style="dark" />
    </AppTypographyProvider>
  );
}
