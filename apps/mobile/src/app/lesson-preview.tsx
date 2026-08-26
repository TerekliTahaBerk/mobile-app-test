import { useRouter } from 'expo-router';

import { LessonPreviewScreen } from '@/modules/learning/ui/lesson-preview-screen';

export default function LessonPreviewRoute() {
  const router = useRouter();

  return <LessonPreviewScreen onBack={() => router.back()} />;
}

