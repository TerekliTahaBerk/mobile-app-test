import { useRouter } from 'expo-router';

import { PrivacyPolicyScreen } from '@/modules/legal/ui/privacy-policy-screen';

export default function PrivacyPolicyRoute() {
  const router = useRouter();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return <PrivacyPolicyScreen onBack={goBack} />;
}
