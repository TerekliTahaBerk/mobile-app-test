import { fireEvent, render, screen } from '@testing-library/react-native';

import { buildWeeklyReportViewModel } from '@/modules/profile/model/build-weekly-report-view-model';
import { WeeklyReportScreen } from '@/modules/profile/ui/weekly-report-screen';
import type { WeeklyReport } from '@/modules/progress/domain/weekly-report';

function reportOf(overrides: Partial<WeeklyReport> = {}): WeeklyReport {
  return {
    accuracy: 0.72,
    accuracyDelta: 0.12,
    activeDays: 5,
    closed: false,
    correctAnswers: 18,
    from: '2026-08-24',
    questions: 25,
    rounds: 7,
    stillWeak: [
      {
        accuracy: 0.25,
        id: 'tyt.history.first-turkish-states.states',
        mainTopicTitle: 'İlk ve Orta Çağlarda Türk Dünyası',
        title: 'İlk Türk Devletleri',
      },
    ],
    strengthened: [
      {
        accuracy: 0.9,
        id: 'tyt.history.time-and-history.measuring-time',
        mainTopicTitle: 'Tarih ve Zaman',
        title: 'Zamanı Ölçmek',
      },
    ],
    to: '2026-08-30',
    ...overrides,
  };
}

function renderReport(
  report: WeeklyReport = reportOf(),
  overrides: Partial<Parameters<typeof WeeklyReportScreen>[0]> = {},
) {
  return render(
    <WeeklyReportScreen
      onBack={jest.fn()}
      onChangeDay={jest.fn()}
      viewModel={buildWeeklyReportViewModel(report, 0)}
      {...overrides}
    />,
  );
}

describe('weekly report', () => {
  it('reports the closed week with the dates it covers', async () => {
    await renderReport();

    expect(screen.getByText('24 Ağu – 30 Ağu · Hafta sürüyor · Pazar günü kapanır')).toBeTruthy();
    expect(screen.getByText('25')).toBeTruthy();
    expect(screen.getByText('%72')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('5/7')).toBeTruthy();
  });

  it('states the accuracy change against the week before', async () => {
    await renderReport();

    expect(screen.getByText('+12 puan')).toBeTruthy();
  });

  it('refuses to imply a change it cannot measure', async () => {
    await renderReport(reportOf({ accuracyDelta: null }));

    expect(screen.getByText('Karşılaştıracak önceki hafta yok')).toBeTruthy();
    expect(screen.queryByText(/puan$/)).toBeNull();
  });

  it('separates what got stronger from what still needs work', async () => {
    await renderReport();

    expect(screen.getByText('Güçlenen konular')).toBeTruthy();
    expect(screen.getByText('Zamanı Ölçmek')).toBeTruthy();
    expect(screen.getByText('Hâlâ tekrar isteyenler')).toBeTruthy();
    expect(screen.getByText('İlk Türk Devletleri')).toBeTruthy();
  });

  it('names next week from what the week actually left open', async () => {
    await renderReport();

    expect(
      screen.getByText('Önümüzdeki hafta İlk Türk Devletleri konusuna öncelik ver.'),
    ).toBeTruthy();
  });

  it('says a silent week was silent instead of showing zeroes', async () => {
    await renderReport(
      reportOf({
        accuracy: null,
        accuracyDelta: null,
        activeDays: 0,
        correctAnswers: 0,
        questions: 0,
        rounds: 0,
        stillWeak: [],
        strengthened: [],
      }),
    );

    expect(screen.getByTestId('weekly-report-empty')).toBeTruthy();
    expect(screen.queryByTestId('stat-questions')).toBeNull();
  });

  it('says whether the week is still running or final', async () => {
    await renderReport(reportOf({ closed: true }));

    expect(screen.getByText('24 Ağu – 30 Ağu · Hafta kapandı')).toBeTruthy();
  });

  it('lets the learner move the day the week closes on', async () => {
    const onChangeDay = jest.fn();

    await renderReport(reportOf(), { onChangeDay });
    await fireEvent.press(screen.getByTestId('report-day-3'));

    expect(onChangeDay).toHaveBeenCalledWith(3);
  });

  it('carries the same words its notification would', async () => {
    const viewModel = buildWeeklyReportViewModel(reportOf(), 0);

    expect(viewModel.notificationText).toBe(
      'Bu hafta 1 alt konuyu güçlendirdin. Raporun hazır.',
    );
  });
});
