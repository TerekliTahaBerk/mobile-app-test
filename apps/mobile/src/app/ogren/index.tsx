import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useHearts } from '@/modules/hearts/application/hearts-store';
import { buildLearnViewModel } from '@/modules/learn/model/build-learn-view-model';
import { learnPreviewData, type LearnViewModel } from '@/modules/learn/model/learn-view-model';
import { LearnScreen } from '@/modules/learn/ui/learn-screen';
import type { ExamFilter } from '@/modules/home/ui/home-screen';
import { useProgressDashboard } from '@/modules/progress/application/use-progress-dashboard';
import { APP_MODE } from '@/shared/config/app-config';
import { useTabNavigation } from '@/shared/navigation/use-tab-navigation';
import { MessageScreen } from '@/shared/ui/feedback/message-screen';

export default function LearnRoute() {
  return APP_MODE === 'designPreview' ? <PreviewLearnRoute /> : <DurableLearnRoute />;
}

function PreviewLearnRoute() {
  return <LearnShell viewModel={learnPreviewData} />;
}

function DurableLearnRoute() {
  const dashboard = useProgressDashboard();
  const hearts = useHearts();

  if (dashboard.status === 'loading') {
    return (
      <MessageScreen
        body="Derslerin okunuyor."
        heading="Hazırlanıyor"
        testID="learn-loading"
        tone="muted"
      />
    );
  }

  if (dashboard.status === 'failed') {
    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: dashboard.refresh }}
        body="Ders listen okunamadı. Kayıtların silinmedi."
        heading="Öğren açılamadı"
        testID="learn-failed"
        tone="dimmed"
      />
    );
  }

  return <LearnShell viewModel={buildLearnViewModel(dashboard.data, hearts.hearts)} />;
}

function LearnShell({ viewModel }: { viewModel: LearnViewModel }) {
  const router = useRouter();
  const onSelectTab = useTabNavigation('ogren');
  const [exam, setExam] = useState<ExamFilter>('tyt');

  return (
    <LearnScreen
      exam={exam}
      onChangeExam={setExam}
      onOpenSubject={(subjectId) => router.push(`/ogren/${subjectId}`)}
      onSelectTab={onSelectTab}
      showExamToggle={APP_MODE === 'designPreview'}
      viewModel={viewModel}
    />
  );
}
