import { useRouter } from 'expo-router';

import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function SettingsRoute() {
  const router = useRouter();

  // There is nothing to configure yet: the app is accountless, stores its
  // progress locally, and sends nothing anywhere. A settings screen that only
  // listed switches with no effect would be worse than saying so.
  return (
    <MessageScreen
      action={{ label: 'Geri dön', onPress: () => router.back() }}
      body="Şimdilik ayarlanacak bir şey yok. Hesabın yok, ilerlemen yalnızca bu cihazda tutuluyor."
      heading="Ayarlar yakında"
      testID="settings-pending"
      tone="muted"
    />
  );
}
