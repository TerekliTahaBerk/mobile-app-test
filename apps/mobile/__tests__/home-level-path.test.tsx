import { fireEvent, screen } from '@testing-library/react-native';

import { KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { HomeScreen } from '@/modules/home/ui/home-screen';
import { renderWithSession } from './support/render-with-session';

describe('home level path', () => {
  it('presents the real unit and the real current level from the content bundle', async () => {
    await renderWithSession(<HomeScreen onSelectTab={jest.fn()} onStartLevel={jest.fn()} />);

    expect(screen.getByText('İlk Türk Devletleri')).toBeTruthy();
    expect(screen.getByText('ÜNİTE 1 · TARİH')).toBeTruthy();

    // Title, exercise count and duration all come from the lesson record.
    expect(screen.getByLabelText(/Kurultay\. Şimdi\. 5 alıştırma · ~4 dk/)).toBeTruthy();
  });

  it('keeps preview levels visible but unopenable, and says so', async () => {
    await renderWithSession(<HomeScreen onSelectTab={jest.fn()} onStartLevel={jest.fn()} />);

    const previewLevel = screen.getByTestId('path-node-preview.first-turkish-states.01');
    expect(previewLevel.props.accessibilityState).toMatchObject({ disabled: true });

    const locked = screen.getByLabelText(/Töre\. Kilitli\./);
    expect(locked.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('starts the real lesson from the level detail panel', async () => {
    const onStartLevel = jest.fn();

    await renderWithSession(<HomeScreen onSelectTab={jest.fn()} onStartLevel={onStartLevel} />);

    expect(screen.queryByTestId('level-detail-panel')).toBeNull();

    await fireEvent.press(screen.getByTestId(`path-node-${KURULTAY_PATH_NODE_ID}`));

    expect(screen.getByTestId('level-detail-panel')).toBeTruthy();
    expect(screen.getByText('5 alıştırma · ~4 dk')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('level-detail-cta'));

    expect(onStartLevel).toHaveBeenCalledWith(KURULTAY_LESSON_ID, KURULTAY_PATH_NODE_ID);
  });

  it('closes the detail panel when the same node is tapped again', async () => {
    await renderWithSession(<HomeScreen onSelectTab={jest.fn()} onStartLevel={jest.fn()} />);

    await fireEvent.press(screen.getByTestId(`path-node-${KURULTAY_PATH_NODE_ID}`));
    await fireEvent.press(screen.getByTestId(`path-node-${KURULTAY_PATH_NODE_ID}`));

    expect(screen.queryByTestId('level-detail-panel')).toBeNull();
  });

  it('marks the path tab selected and routes every other enabled tab', async () => {
    const onSelectTab = jest.fn();

    await renderWithSession(<HomeScreen onSelectTab={onSelectTab} onStartLevel={jest.fn()} />);

    expect(screen.getByTestId('tab-yol').props.accessibilityState).toMatchObject({
      selected: true,
    });

    await fireEvent.press(screen.getByTestId('tab-gorev'));
    await fireEvent.press(screen.getByTestId('tab-profil'));

    expect(onSelectTab.mock.calls.map(([tab]) => tab)).toEqual(['gorev', 'profil']);
  });
});
