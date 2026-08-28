import { useRouter } from 'expo-router';

import { PremiumSheetScreen } from '@/modules/premium/ui/premium-sheet-screen';
import { FEATURES } from '@/shared/config/app-config';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function PremiumRoute() {
  const router = useRouter();
  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!FEATURES.plus) {
    return (
      <MessageScreen
        action={{ label: 'Ana Sayfa', onPress: () => router.replace('/') }}
        body="Bu pilotta satın alma veya ücretli üyelik yok. Tüm çalışma turları sınırsız açık."
        heading="Premium kapalı"
        testID="premium-disabled"
        tone="muted"
      />
    );
  }

  return (
    <PremiumSheetScreen
      onDismiss={dismiss}
      // There is no billing integration; the sheet explains Premium but must
      // not offer a purchase that cannot be completed.
      onPurchase={dismiss}
      purchasable
    />
  );
}
