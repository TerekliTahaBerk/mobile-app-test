import { useRouter } from 'expo-router';

import { buildDurableIzViewModel } from '@/modules/iz/model/iz-preview-data';
import { IzCelebrationScreen } from '@/modules/iz/ui/iz-celebration-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function IzRoute() {
  return APP_MODE === 'designPreview' ? <PreviewIzRoute /> : <DurableIzRoute />;
}

function PreviewIzRoute() {
  const router = useRouter();

  return <IzCelebrationScreen onContinue={() => router.dismissTo('/')} />;
}

function DurableIzRoute() {
  const router = useRouter();
  const dashboard = useProgressDashboard();

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Bu haftaki çalışman okunuyor."
        heading="İzin hazırlanıyor"
        mood="thinking"
        testID="iz-loading"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'TEKRAR DENE', onPress: dashboard.refresh }}
        body="İz kayıtların okunamadı. Hiçbir kayıt silinmedi."
        heading="İzin açılamadı"
        mood="sad"
      />
    );
  }

  return (
    <IzCelebrationScreen
      data={buildDurableIzViewModel(dashboard.data.iz.current, dashboard.data.week)}
      onContinue={() => router.dismissTo('/')}
    />
  );
}
