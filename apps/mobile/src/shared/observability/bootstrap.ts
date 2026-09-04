import { installProductionObservability } from '@/shared/observability/sentry-adapter';

// This module is imported before application content and storage modules so
// module-load failures and unhandled exceptions reach the crash provider.
installProductionObservability();
