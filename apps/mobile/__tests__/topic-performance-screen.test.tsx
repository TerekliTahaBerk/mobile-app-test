import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ProfileViewModel } from '@/modules/profile/model/profile-view-model';
import { TopicPerformanceScreen } from '@/modules/profile/ui/topic-performance-screen';

const topics: ProfileViewModel['topicPerformance'] = [
  {
    accuracy: 1 / 3,
    accuracyLabel: '%33 doğruluk',
    band: 'needsPractice',
    correctAnswers: 1,
    detail: '1 doğru · 2 yanlış',
    id: 'unit.history.states',
    nextReviewLabel: 'Sonraki tekrar 29 Ağu',
    statusLabel: 'Tekrar gerekli',
    subtopics: [
      {
        accuracy: 0,
        accuracyLabel: '%0',
        band: 'needsPractice',
        correctAnswers: 0,
        detail: '0 doğru · 2 yanlış',
        id: 'topic.history.states',
        nextReviewLabel: 'Sonraki tekrar 29 Ağu',
        statusLabel: 'Tekrar gerekli',
        title: 'İlk Türk Devletleri',
        totalAttempts: 2,
        wrongAnswers: 2,
      },
      {
        accuracy: 1,
        accuracyLabel: '%100',
        band: 'developing',
        correctAnswers: 1,
        detail: '1 doğru · 0 yanlış',
        id: 'topic.history.kurultay',
        nextReviewLabel: null,
        statusLabel: 'Gelişiyor',
        title: 'Kut ve Töre',
        totalAttempts: 1,
        wrongAnswers: 0,
      },
    ],
    title: 'İlk ve Orta Çağlarda Türk Dünyası',
    totalAttempts: 3,
    wrongAnswers: 2,
  },
  {
    accuracy: 1,
    accuracyLabel: '%100 doğruluk',
    band: 'strong',
    correctAnswers: 3,
    detail: '3 doğru · 0 yanlış',
    id: 'unit.history.time',
    nextReviewLabel: null,
    statusLabel: 'Güçlü',
    subtopics: [],
    title: 'Tarih ve Zaman',
    totalAttempts: 3,
    wrongAnswers: 0,
  },
];

describe('detailed topic performance', () => {
  it('shows the overview, priority groups, and subtopic evidence', async () => {
    await render(
      <TopicPerformanceScreen onBack={jest.fn()} onStartPractice={jest.fn()} topics={topics} />,
    );

    expect(screen.getByText('%67')).toBeTruthy();
    expect(screen.getByText('Tekrar etmen gerekenler')).toBeTruthy();
    expect(screen.getByText('Güçlü olduğun konular')).toBeTruthy();
    expect(screen.getByText('İlk Türk Devletleri')).toBeTruthy();
    expect(screen.getByText('Kut ve Töre')).toBeTruthy();
  });

  it('returns through its own header action', async () => {
    const onBack = jest.fn();
    await render(
      <TopicPerformanceScreen onBack={onBack} onStartPractice={jest.fn()} topics={topics} />,
    );

    await fireEvent.press(screen.getByTestId('topic-performance-back'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('starts a targeted drill from a non-strong subtopic', async () => {
    const onStartPractice = jest.fn();
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onStartPractice={onStartPractice}
        topics={topics}
      />,
    );

    await fireEvent.press(screen.getByTestId('practice-topic-topic.history.states'));

    expect(onStartPractice).toHaveBeenCalledWith('topic.history.states', 0);
    expect(screen.getByText('Sonraki tekrar 29 Ağu')).toBeTruthy();
  });
});
