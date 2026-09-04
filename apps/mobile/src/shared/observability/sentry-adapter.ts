import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

import {
  setObservabilityAdapter,
  type DiagnosticSnapshot,
  type ErrorContext,
  type ObservabilityAdapter,
} from '@/shared/observability/observability';

const PRODUCTION_ENVIRONMENT = 'production';
const APPROVED_PRIVACY_REVIEW = 'approved-2026-09-04';
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
const privacyReview = process.env.EXPO_PUBLIC_SENTRY_PRIVACY_REVIEW?.trim();

export const OBSERVABILITY_ENVIRONMENT =
  process.env.EXPO_PUBLIC_OBSERVABILITY_ENVIRONMENT?.trim() || 'local';

const appVersion = Constants.expoConfig?.version ?? 'unknown';
const buildVersion =
  Constants.expoConfig?.ios?.buildNumber ??
  Constants.expoConfig?.android?.versionCode?.toString() ??
  'unknown';

export const OBSERVABILITY_RELEASE = `com.tekrarla.app@${appVersion}+${buildVersion}`;

type SentryErrorEvent = Parameters<
  NonNullable<Parameters<typeof Sentry.init>[0]['beforeSend']>
>[0];

const PRIVATE_KEYS = new Set([
  'answer',
  'deviceid',
  'displayname',
  'email',
  'freetext',
  'identifier',
  'installationid',
  'ipaddress',
  'phone',
  'rawanswer',
  'userid',
  'username',
]);

/** Last-line defence in case an SDK integration or future caller adds PII. */
export function scrubPrivateData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(scrubPrivateData);
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const clean: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.replaceAll(/[^a-zA-Z]/g, '').toLowerCase();
    if (!PRIVATE_KEYS.has(normalized)) {
      clean[key] = scrubPrivateData(child);
    }
  }
  return clean;
}

export function sanitizeSentryEvent(event: SentryErrorEvent): SentryErrorEvent {
  const sanitized = scrubPrivateData(event) as SentryErrorEvent;
  delete sanitized.user;
  delete sanitized.request;

  if (sanitized.contexts?.device) {
    const { name: _name, ...device } = sanitized.contexts.device;
    sanitized.contexts.device = device;
  }
  return sanitized;
}

export function createSentryAdapter(): ObservabilityAdapter {
  return {
    captureEvent: (name, payload) => {
      Sentry.addBreadcrumb({
        category: 'product',
        data: scrubPrivateData(payload) as Record<string, unknown>,
        level: 'info',
        message: name,
      });
    },
    captureException: (error: Error, context: ErrorContext) => {
      Sentry.captureException(error, {
        contexts: {
          failure: scrubPrivateData(context) as Record<string, unknown>,
        },
        ...(context.operation === undefined ? {} : { tags: { operation: context.operation } }),
      });
    },
    recordDiagnostics: (snapshot: DiagnosticSnapshot) => {
      Sentry.setTags({
        appMode: snapshot.appMode,
        contentVersion: snapshot.contentVersion,
        environment: snapshot.environment,
        release: snapshot.release,
        schemaVersion: snapshot.schemaVersion,
      });
    },
  };
}

export function installProductionObservability(): boolean {
  if (
    __DEV__ ||
    OBSERVABILITY_ENVIRONMENT !== PRODUCTION_ENVIRONMENT ||
    privacyReview !== APPROVED_PRIVACY_REVIEW ||
    !dsn
  ) {
    return false;
  }

  try {
    Sentry.init({
      beforeSend: sanitizeSentryEvent,
      dsn,
      enableNativeCrashHandling: true,
      enabled: true,
      environment: OBSERVABILITY_ENVIRONMENT,
      release: OBSERVABILITY_RELEASE,
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
    Sentry.setUser(null);
    setObservabilityAdapter(createSentryAdapter());
    return true;
  } catch (cause) {
    if (__DEV__) {
      console.warn('[Tekrarla] Sentry başlatılamadı:', cause);
    }
    return false;
  }
}
