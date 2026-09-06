import { useRouter } from 'expo-router';

import { SupportScreen } from '@/modules/legal/ui/support-screen';

export default function SupportRoute() {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return <SupportScreen onBack={goBack} />;
}
