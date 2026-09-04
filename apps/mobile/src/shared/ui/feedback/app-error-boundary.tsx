import { Component, type ErrorInfo, type ReactNode } from 'react';

import { MessageScreen } from '@/shared/ui/feedback/message-screen';
import { reportError } from '@/shared/observability/observability';

type AppErrorBoundaryProps = {
  children: ReactNode;
  /**
   * Optional secondary hook for callers and tests. The shared observability
   * adapter always receives the exception first.
   */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

/**
 * Contains a render crash so the learner sees a branded way out instead of a
 * blank screen. React has no function-component equivalent, so this stays a
 * class.
 *
 * Recovery is a remount of the subtree. Durable progress lives in SQLite and is
 * re-read on focus, so nothing is lost by re-rendering from the route.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Tekrarla] Beklenmeyen bir hata yakalandı:', error, info.componentStack);
    reportError(error, { componentStack: info.componentStack });
    this.props.onError?.(error, info);
  }

  private readonly retry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error === null) {
      return this.props.children;
    }

    return (
      <MessageScreen
        action={{ label: 'Tekrar dene', onPress: this.retry }}
        body="Beklenmeyen bir sorun çıktı. Serin ve ilerlemen yerinde — tekrar deneyebilirsin."
        detail={__DEV__ ? error.message : undefined}
        heading="Bir şeyler ters gitti"
        tone="dimmed"
        testID="app-error-boundary"
      />
    );
  }
}
