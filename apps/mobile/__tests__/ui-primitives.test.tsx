import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { ProgressBar } from '@/shared/ui/components/progress-bar';

describe('design primitives', () => {
  it('prevents disabled button interaction and exposes its state', async () => {
    const onPress = jest.fn();

    await render(<AppButton disabled label="Devre dışı" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Devre dışı' });
    fireEvent.press(button);

    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('compresses the primary button face while pressed', async () => {
    let observedPressedOffset: number | undefined;

    await render(
      <AppButton
        label="Devam"
        onLongPress={() => {
          const transform = StyleSheet.flatten(
            screen.getByTestId('primary-button-face').props.style,
          ).transform;
          observedPressedOffset = transform?.[0]?.translateY;
        }}
        onPress={jest.fn()}
        testID="primary-button"
      />,
    );

    const button = screen.getByTestId('primary-button');
    const face = screen.getByTestId('primary-button-face');

    expect(StyleSheet.flatten(face.props.style).transform).toBeUndefined();

    await userEvent.setup().longPress(button);

    expect(observedPressedOffset).toBeGreaterThan(0);
    expect(StyleSheet.flatten(screen.getByTestId('primary-button-face').props.style).transform).toBeUndefined();
  });

  it('clamps progress and exposes an accessible percentage', async () => {
    await render(<ProgressBar accessibilityLabel="Örnek ilerleme" value={1.4} />);

    expect(screen.getByLabelText('Örnek ilerleme').props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 100,
      text: '100%',
    });
  });
});
