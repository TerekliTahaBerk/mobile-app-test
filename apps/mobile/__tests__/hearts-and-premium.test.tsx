import { fireEvent, render, screen } from '@testing-library/react-native';

import { HeartsEmptyScreen } from '@/modules/hearts/ui/hearts-empty-screen';
import { PremiumSheetScreen } from '@/modules/premium/ui/premium-sheet-screen';

describe('out of hearts', () => {
  function renderEmpty(overrides: Partial<Parameters<typeof HeartsEmptyScreen>[0]> = {}) {
    return render(
      <HeartsEmptyScreen
        onClose={jest.fn()}
        onOpenPremium={jest.fn()}
        onPractice={null}
        onWait={jest.fn()}
        waitLabel="18 dk"
        {...overrides}
      />,
    );
  }

  it('says when the next heart arrives instead of just blocking', async () => {
    await renderEmpty();

    expect(screen.getByText('Canların bitti.')).toBeTruthy();
    expect(screen.getByText('18 dk')).toBeTruthy();
  });

  it('offers no advertising route past the limit', async () => {
    await renderEmpty();

    expect(screen.queryByText(/reklam/i)).toBeNull();
    expect(screen.getByTestId('hearts-premium')).toBeTruthy();
    expect(screen.getByTestId('hearts-wait')).toBeTruthy();
  });

  it('withholds the practice route until a drill exists behind it', async () => {
    await renderEmpty();

    expect(screen.queryByTestId('hearts-practice')).toBeNull();
  });

  it('offers the practice round when one is available', async () => {
    const onPractice = jest.fn();

    await renderEmpty({ onPractice });
    await fireEvent.press(screen.getByTestId('hearts-practice'));

    expect(onPractice).toHaveBeenCalledTimes(1);
  });
});

describe('premium sheet', () => {
  it('names what money buys and what it does not', async () => {
    await render(
      <PremiumSheetScreen onDismiss={jest.fn()} onPurchase={jest.fn()} purchasable />,
    );

    expect(screen.getByText('Sınırsız can')).toBeTruthy();
    expect(screen.getByText('XP, seri ve lig sıralaması satın alınamaz.')).toBeTruthy();
  });

  it('does not offer a purchase that cannot be completed', async () => {
    const onPurchase = jest.fn();

    await render(
      <PremiumSheetScreen
        onDismiss={jest.fn()}
        onPurchase={onPurchase}
        purchasable={false}
      />,
    );

    expect(screen.queryByTestId('premium-purchase')).toBeNull();
    expect(screen.getByText(/Premium henüz satışta değil/)).toBeTruthy();
  });

  it('always leaves a way out of the sheet', async () => {
    const onDismiss = jest.fn();

    await render(
      <PremiumSheetScreen
        onDismiss={onDismiss}
        onPurchase={jest.fn()}
        purchasable={false}
      />,
    );

    await fireEvent.press(screen.getByTestId('premium-dismiss'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
