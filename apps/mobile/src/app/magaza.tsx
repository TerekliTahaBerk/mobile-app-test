import { Redirect, useRouter } from 'expo-router';

import { StoreScreen } from '@/modules/store/ui/store-screen';
import { FEATURES } from '@/shared/config/app-config';

export default function MagazaRoute() {
  const router = useRouter();

  // There is no billing integration; a pilot build must not advertise a plan
  // that cannot be purchased.
  if (!FEATURES.plus) {
    return <Redirect href="/" />;
  }

  return <StoreScreen onClose={() => router.replace('/')} />;
}
