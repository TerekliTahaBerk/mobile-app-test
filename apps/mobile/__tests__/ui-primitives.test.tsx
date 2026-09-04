import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AppButton } from '@/shared/ui/components/app-button';
import { HudChip } from '@/shared/ui/components/hud-chip';
import { ProgressBar } from '@/shared/ui/components/progress-bar';
import { SegmentedToggle } from '@/shared/ui/components/segmented-toggle';
import { StepProgress } from '@/shared/ui/components/step-progress';
import { Dino } from '@/shared/ui/dino/dino';
import { theme } from '@/shared/ui/theme/tokens';

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe('design primitives', () => {
  it('keeps small muted semantic text at AA contrast on light surfaces', () => {
    for (const ink of [theme.colors.text.muted, theme.colors.text.faint]) {
      expect(contrastRatio(ink, theme.colors.background.app)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(ink, theme.colors.surface.default)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('prevents disabled button interaction and exposes its state', async () => {
    const onPress = jest.fn();

    await render(<AppButton disabled label="Devre dışı" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Devre dışı' });
    await fireEvent.press(button);

    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('compresses the button face onto its structural edge while pressed', async () => {
    let pressedOffset: number | undefined;

    await render(
      <AppButton
        label="Devam"
        onLongPress={() => {
          const { transform } = StyleSheet.flatten(
            screen.getByTestId('primary-button-face').props.style,
          );
          pressedOffset = transform?.[0]?.translateY;
        }}
        onPress={jest.fn()}
        testID="primary-button"
      />,
    );

    const face = screen.getByTestId('primary-button-face');
    expect(StyleSheet.flatten(face.props.style).transform).toBeUndefined();

    await userEvent.setup().longPress(screen.getByTestId('primary-button'));

    expect(pressedOffset).toBeGreaterThan(0);
    expect(
      StyleSheet.flatten(screen.getByTestId('primary-button-face').props.style).transform,
    ).toBeUndefined();
  });

  it('clamps progress and exposes an accessible percentage', async () => {
    await render(<ProgressBar accessibilityLabel="Örnek ilerleme" value={1.4} />);

    expect(screen.getByLabelText('Örnek ilerleme').props.accessibilityValue).toEqual({
      max: 100,
      min: 0,
      now: 100,
      text: '%100',
    });
  });

  it('counts a session gain into the announced total without overflowing', async () => {
    await render(
      <ProgressBar accessibilityLabel="Ünite" gainValue={0.9} value={0.35} />,
    );

    expect(screen.getByLabelText('Ünite').props.accessibilityValue).toMatchObject({
      now: 100,
    });
  });

  it('states each counter in words rather than by icon alone', async () => {
    await render(<HudChip kind="streak" value={12} />);
    expect(screen.getByLabelText('12 günlük seri')).toBeTruthy();

    await render(<HudChip kind="hearts" value={null} />);
    expect(screen.getByLabelText('Sınırsız can')).toBeTruthy();
  });

  it('selects the mascot pose semantically', async () => {
    await render(<Dino accessibilityLabel="Çalışma rehberi Dino" pose="writing" size={72} />);
    expect(screen.getByTestId('dino-writing')).toBeTruthy();

    await render(<Dino accessibilityLabel="Mezuniyet Dino" pose="graduation" size={96} />);
    expect(screen.getByTestId('dino-graduation')).toBeTruthy();
  });

  it('marks the chosen segment as selected', async () => {
    const onChange = jest.fn();

    await render(
      <SegmentedToggle
        accessibilityLabel="Sınav"
        onChange={onChange}
        options={[
          { label: 'TYT', value: 'tyt' },
          { label: 'AYT', value: 'ayt' },
        ]}
        value="tyt"
      />,
    );

    expect(screen.getByTestId('segment-tyt').props.accessibilityState).toMatchObject({
      selected: true,
    });

    await fireEvent.press(screen.getByTestId('segment-ayt'));
    expect(onChange).toHaveBeenCalledWith('ayt');
  });

  it('reports how far through a multi-step flow the learner is', async () => {
    await render(
      <StepProgress accessibilityLabel="Adım 3 / 7" currentStep={3} totalSteps={7} />,
    );

    expect(screen.getByLabelText('Adım 3 / 7').props.accessibilityValue).toEqual({
      max: 7,
      min: 0,
      now: 3,
    });
  });
});
