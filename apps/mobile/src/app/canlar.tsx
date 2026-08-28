import { useRouter } from 'expo-router';

import { useHearts } from '@/modules/hearts/application/hearts-store';
import { HeartsEmptyScreen } from '@/modules/hearts/ui/hearts-empty-screen';
import { formatHeartWait } from '@/modules/progress/domain/hearts-policy';

export default function HeartsRoute() {
  const router = useRouter();
  const hearts = useHearts();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <HeartsEmptyScreen
      onClose={close}
      onOpenPremium={() => router.replace('/premium')}
      // A free practice round is the only way to earn a heart back. It is not
      // wired to a drill yet, so it is withheld rather than offered as a
      // button that does nothing.
      onPractice={null}
      onWait={close}
      waitLabel={hearts.nextHeartInMs === null ? 'hazır' : formatHeartWait(hearts.nextHeartInMs)}
    />
  );
}
