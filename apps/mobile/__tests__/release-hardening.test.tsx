import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import NotFoundRoute from '@/app/+not-found';
import { AppErrorBoundary } from '@/shared/ui/feedback/app-error-boundary';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function Exploding(): never {
  throw new Error('patlama');
}

describe('error boundary', () => {
  const consoleError = console.error;

  beforeEach(() => {
    mockReplace.mockClear();
    // React logs the caught error itself; keep the suite output readable.
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('renders the children while nothing has thrown', async () => {
    await render(
      <AppErrorBoundary>
        <Text>sağlam</Text>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('sağlam')).toBeTruthy();
    expect(screen.queryByTestId('app-error-boundary')).toBeNull();
  });

  it('contains a render crash behind a branded screen instead of a blank one', async () => {
    await render(
      <AppErrorBoundary>
        <Exploding />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('app-error-boundary')).toBeTruthy();
    expect(screen.getByText('Bir şeyler ters gitti')).toBeTruthy();
    expect(screen.getByTestId('message-action')).toBeTruthy();
  });

  it('reports the crash so a future reporter can receive it', async () => {
    const onError = jest.fn();

    await render(
      <AppErrorBoundary onError={onError}>
        <Exploding />
      </AppErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });
});

describe('unknown routes', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it('gives a stale deep link a way back to the path', async () => {
    await render(<NotFoundRoute />);

    expect(screen.getByTestId('not-found-screen')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('message-action'));

    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
