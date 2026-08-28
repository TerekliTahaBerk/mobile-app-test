import { useRouter } from 'expo-router';

import { MessageScreen } from '@/shared/ui/feedback/message-screen';

/**
 * Catches unknown deep links. The app registers the app scheme, so a
 * stale or mistyped link has to land somewhere the learner can leave from.
 */
export default function NotFoundRoute() {
  const router = useRouter();

  return (
    <MessageScreen
      action={{ label: 'Ana Sayfa', onPress: () => router.replace('/') }}
      body="Aradığın sayfa taşınmış ya da hiç var olmamış olabilir."
      heading="Bu sayfayı bulamadım"
      tone="muted"
      testID="not-found-screen"
    />
  );
}
