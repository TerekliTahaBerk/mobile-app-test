import { useRouter } from 'expo-router';

import { StoreScreen } from '@/modules/store/ui/store-screen';

export default function MagazaRoute() {
  const router = useRouter();

  return <StoreScreen onClose={() => router.replace('/')} />;
}
