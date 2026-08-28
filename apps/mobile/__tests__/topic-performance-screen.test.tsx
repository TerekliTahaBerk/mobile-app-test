import { fireEvent, render, screen } from '@testing-library/react-native';

import { TOPIC_WINDOW_OPTIONS } from '@/modules/profile/model/build-topic-performance-view-model';
import type {
  MainTopicCard,
  SubtopicCard,
  TopicPerformanceViewModel,
} from '@/modules/profile/model/topic-performance-view-model';
import { TopicPerformanceScreen } from '@/modules/profile/ui/topic-performance-screen';

function subtopic(overrides: Partial<SubtopicCard> = {}): SubtopicCard {
  return {
    accuracy: 0,
    accuracyLabel: '%0',
    attemptSplitLabel: null,
    band: 'needsPractice',
    detail: '0 doğru · 2 yanlış',
    evidenceLabel: '2 soru',
    id: 'topic.history.states',
    lastStudiedLabel: 'Dün çalıştın',
    lowEvidenceNote: 'Bu sonuç için henüz az veri var; çözdükçe netleşecek.',
    nextReviewLabel: 'Sonraki tekrar 29 Ağu',
    staleLabel: null,
    statusLabel: 'Tekrar gerekli',
    title: 'İlk Türk Devletleri',
    totalAttempts: 2,
    trend: 'unknown',
    trendLabel: null,
    ...overrides,
  };
}

function mainTopic(overrides: Partial<MainTopicCard> = {}): MainTopicCard {
  const { attemptSplitLabel: _ignored, ...base } = subtopic();

  return {
    ...base,
    accuracy: 1 / 3,
    accuracyLabel: '%33',
    coverageLabel: '8 alt konunun 2 tanesi ölçüldü',
    detail: '1 doğru · 2 yanlış',
    evidenceLabel: '3 soru',
    id: 'unit.history.states',
    lowEvidenceNote: null,
    subtopics: [
      subtopic(),
      subtopic({
        accuracy: 1,
        accuracyLabel: '%100',
        attemptSplitLabel: 'İlk denemede %50 · tekrarda %100',
        band: 'developing',
        evidenceLabel: '1 soru',
        id: 'topic.history.kurultay',
        nextReviewLabel: null,
        statusLabel: 'Gelişiyor',
        title: 'Kut ve Töre',
        totalAttempts: 1,
        trend: 'rising',
        trendLabel: 'Yükseliyor',
      }),
    ],
    title: 'İlk ve Orta Çağlarda Türk Dünyası',
    totalAttempts: 3,
    ...overrides,
  };
}

function viewModelFor(
  overrides: Partial<TopicPerformanceViewModel> = {},
): TopicPerformanceViewModel {
  return {
    correctedToday: [],
    emptyReason: null,
    overall: {
      accuracy: 0.67,
      accuracyLabel: '%67',
      correctAnswers: 4,
      evidenceLabel: '6 soru',
      lowEvidence: false,
      mainTopics: 2,
      wrongAnswers: 2,
    },
    topics: [
      mainTopic(),
      mainTopic({
        accuracy: 1,
        accuracyLabel: '%100',
        band: 'strong',
        coverageLabel: '4 alt konunun 4 tanesi ölçüldü',
        detail: '3 doğru · 0 yanlış',
        id: 'unit.history.time',
        lastStudiedLabel: 'Son çalışma 12 Ağu',
        statusLabel: 'Güçlü',
        subtopics: [],
        title: 'Tarih ve Zaman',
      }),
    ],
    window: 'all',
    windowOptions: TOPIC_WINDOW_OPTIONS,
    ...overrides,
  };
}

describe('detailed topic performance', () => {
  it('shows the overview, priority groups, and subtopic evidence', async () => {
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    expect(screen.getByText('%67')).toBeTruthy();
    expect(screen.getByText('Tekrar etmen gerekenler')).toBeTruthy();
    expect(screen.getByText('Güçlü olduğun konular')).toBeTruthy();
    expect(screen.getAllByText('İlk Türk Devletleri').length).toBeGreaterThan(0);
    expect(screen.getByText('Kut ve Töre')).toBeTruthy();
  });

  it('never shows a percentage without the evidence behind it', async () => {
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    expect(screen.getByText('6 soru')).toBeTruthy();
    expect(screen.getAllByText('2 soru').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8 alt konunun 2 tanesi ölçüldü').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('Bu sonuç için henüz az veri var; çözdükçe netleşecek.').length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Yükseliyor')).toBeTruthy();
    expect(screen.getByText('İlk denemede %50 · tekrarda %100')).toBeTruthy();
  });

  it('switches the reporting window from its own control', async () => {
    const onChangeWindow = jest.fn();
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={onChangeWindow}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    await fireEvent.press(screen.getByTestId('segment-last7'));

    expect(onChangeWindow).toHaveBeenCalledWith('last7');
  });

  it('separates an empty window from an empty history', async () => {
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor({ emptyReason: 'noDataInWindow', window: 'last7' })}
      />,
    );

    expect(screen.getByText('Bu aralıkta çözülen soru yok')).toBeTruthy();
  });

  it('celebrates what the learner fixed today', async () => {
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor({
          correctedToday: [
            {
              detail: '2 soruyu düzelttin · İlk ve Orta Çağlarda Türk Dünyası',
              id: 'topic.history.states',
              title: 'İlk Türk Devletleri',
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId('corrected-today')).toBeTruthy();
    expect(screen.getByText('2 soruyu düzelttin · İlk ve Orta Çağlarda Türk Dünyası')).toBeTruthy();
  });

  it('returns through its own header action', async () => {
    const onBack = jest.fn();
    await render(
      <TopicPerformanceScreen
        onBack={onBack}
        onChangeWindow={jest.fn()}
        onStartPractice={jest.fn()}
        viewModel={viewModelFor()}
      />,
    );

    await fireEvent.press(screen.getByTestId('topic-performance-back'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('starts a targeted drill from a non-strong subtopic', async () => {
    const onStartPractice = jest.fn();
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={onStartPractice}
        viewModel={viewModelFor()}
      />,
    );

    await fireEvent.press(screen.getByTestId('practice-topic-topic.history.states'));

    expect(onStartPractice).toHaveBeenCalledWith('topic.history.states', 0);
    expect(screen.getAllByText('Sonraki tekrar 29 Ağu').length).toBeGreaterThan(0);
  });

  it('offers a refresher on a strength that has gone unmeasured', async () => {
    const onStartPractice = jest.fn();
    await render(
      <TopicPerformanceScreen
        onBack={jest.fn()}
        onChangeWindow={jest.fn()}
        onStartPractice={onStartPractice}
        viewModel={viewModelFor({
          topics: [
            mainTopic({
              band: 'strong',
              statusLabel: 'Güçlü',
              subtopics: [
                subtopic({
                  accuracy: 0.9,
                  accuracyLabel: '%90',
                  band: 'strong',
                  id: 'topic.history.kurultay',
                  staleLabel: '21 gündür çözülmedi · tazeleme zamanı',
                  statusLabel: 'Güçlü',
                  title: 'Kut ve Töre',
                }),
              ],
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('21 gündür çözülmedi · tazeleme zamanı')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('practice-topic-topic.history.kurultay'));

    expect(onStartPractice).toHaveBeenCalledWith('topic.history.kurultay', 0.9);
  });
});
