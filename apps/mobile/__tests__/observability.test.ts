import {
  reportError,
  setObservabilityAdapter,
  trackEvent,
  type ObservabilityAdapter,
} from '@/shared/observability/observability';

describe('observability seam', () => {
  afterEach(() => setObservabilityAdapter(null));

  it('forwards typed, privacy-conscious events and errors to a configured adapter', () => {
    const captureEvent = jest.fn();
    const captureException = jest.fn();
    const adapter: ObservabilityAdapter = {
      captureEvent,
      captureException,
      recordDiagnostics: jest.fn(),
    };
    setObservabilityAdapter(adapter);

    trackEvent('exercise_answered', {
      attemptNumber: 1,
      correct: true,
      exerciseId: 'exercise.history.time.001.mcq01',
      lessonId: 'lesson.history.time.001',
      sessionKind: 'lesson',
    });
    reportError(new Error('storage'), { operation: 'profile.write' });

    expect(captureEvent).toHaveBeenCalledWith(
      'exercise_answered',
      expect.not.objectContaining({ answer: expect.anything(), displayName: expect.anything() }),
    );
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('never lets a failing telemetry provider break product behavior', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    setObservabilityAdapter({
      captureEvent: () => {
        throw new Error('provider unavailable');
      },
      captureException: () => undefined,
      recordDiagnostics: () => undefined,
    });

    expect(() => trackEvent('onboarding_started', {})).not.toThrow();
    consoleWarn.mockRestore();
  });
});
