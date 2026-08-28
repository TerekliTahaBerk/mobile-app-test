import { useLocalSearchParams, useRouter } from 'expo-router';

import { useHearts } from '@/modules/hearts/application/hearts-store';
import { buildUnitPathViewModel } from '@/modules/learn/model/build-unit-path-view-model';
import {
  unitPathPreviewData,
  type PathStepView,
  type UnitPathViewModel,
} from '@/modules/learn/model/unit-path-view-model';
import { UnitPathScreen } from '@/modules/learn/ui/unit-path-screen';
import { useLessonSession } from '@/modules/learning/application/lesson-session-store';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function UnitPathRoute() {
  return APP_MODE === 'designPreview' ? <PreviewUnitPathRoute /> : <DurableUnitPathRoute />;
}

function PreviewUnitPathRoute() {
  return <UnitPathShell viewModel={unitPathPreviewData} />;
}

function DurableUnitPathRoute() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const dashboard = useProgressDashboard();
  const hearts = useHearts();
  const router = useRouter();

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Ünite yolun hazırlanıyor."
        heading="Hazırlanıyor"
        testID="unit-path-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Bu dersin yolu okunamadı. Kayıtların silinmedi."
        heading="Yol açılamadı"
        testID="unit-path-failed"
        tone="dimmed"
      />
    );
  }

  const subject = dashboard.data.subjects.get(subjectId);
  if (subject === undefined || subject.totalUnits === 0) {
    return (
      <MessageScreen
        action={{ label: 'Derslere dön', onPress: () => router.replace('/ogren') }}
        body="Bu ders için henüz çalışma eklenmedi. Hazır olduğunda burada olacak."
        heading="Ders yakında"
        testID="unit-path-empty"
        tone="muted"
      />
    );
  }

  return (
    <UnitPathShell
      viewModel={buildUnitPathViewModel({
        hearts: hearts.hearts,
        streak: dashboard.data.streak.current,
        subject,
      })}
    />
  );
}

function UnitPathShell({ viewModel }: { viewModel: UnitPathViewModel }) {
  const router = useRouter();
  const { begin } = useLessonSession();
  const onSelectTab = useTabNavigation('ogren');
  const hearts = useHearts();

  const openStep = (step: PathStepView) => {
    if (step.lessonId === undefined) {
      return;
    }
    if (!hearts.unlimited && hearts.hearts !== null && hearts.hearts <= 0) {
      router.push('/canlar');
      return;
    }

    begin(step.lessonId, step.id);
    router.push('/lesson');
  };

  return (
    <UnitPathScreen
      onBack={() => router.replace('/ogren')}
      onSelectStep={openStep}
      onSelectTab={onSelectTab}
      viewModel={viewModel}
    />
  );
}
