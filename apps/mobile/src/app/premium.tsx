import { useRouter } from 'expo-router';

import { PremiumSheetScreen } from '@/modules/premium/ui/premium-sheet-screen';
import { FEATURES } from '@/shared/config/app-config';

export default function PremiumRoute() {
  const router = useRouter();
  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <PremiumSheetScreen
      onDismiss={dismiss}
      // There is no billing integration; the sheet explains Premium but must
      // not offer a purchase that cannot be completed.
      onPurchase={dismiss}
      purchasable={FEATURES.plus}
    />
  );
}
