jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  init: jest.fn(),
  setTags: jest.fn(),
  setUser: jest.fn(),
}));

import {
  sanitizeSentryEvent,
  scrubPrivateData,
} from '@/shared/observability/sentry-adapter';

describe('Sentry observability adapter privacy', () => {
  it('removes prohibited learner and device fields recursively', () => {
    expect(
      scrubPrivateData({
        displayName: 'Öğrenci',
        exerciseId: 'exercise.history.001',
        nested: { device_id: 'device-123', rawAnswer: 'A', result: 'incorrect' },
      }),
    ).toEqual({ exerciseId: 'exercise.history.001', nested: { result: 'incorrect' } });
  });

  it('drops Sentry user, request, and device-name data while retaining diagnostics', () => {
    const event = sanitizeSentryEvent({
      contexts: {
        device: { family: 'iPhone', name: 'Berk\'s iPhone' },
        runtime: { name: 'react-native', version: '0.86.3' },
      },
      environment: 'production',
      extra: { freeText: 'private note', schemaVersion: 5 },
      release: 'com.tekrarla.app@1.0.0+1',
      request: { url: 'tekrarla://lesson?answer=A' },
      tags: { contentVersion: '2027.1' },
      type: undefined,
      user: { email: 'student@example.com', id: 'local-user' },
    });

    expect(event).toMatchObject({
      contexts: {
        device: { family: 'iPhone' },
        runtime: { name: 'react-native', version: '0.86.3' },
      },
      environment: 'production',
      extra: { schemaVersion: 5 },
      release: 'com.tekrarla.app@1.0.0+1',
      tags: { contentVersion: '2027.1' },
    });
    expect(event).not.toHaveProperty('request');
    expect(event).not.toHaveProperty('user');
  });
});
