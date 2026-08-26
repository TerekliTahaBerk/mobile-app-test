import { fireEvent, render, screen } from '@testing-library/react-native';

import { LessonPreviewScreen } from '@/modules/learning/ui/lesson-preview-screen';

describe('lesson preview screen', () => {
  it('renders presentation-only choices and supports returning to the path', async () => {
    const onBack = jest.fn();

    await render(<LessonPreviewScreen onBack={onBack} />);

    expect(screen.getByText(/Tanzimat Fermanı/)).toBeTruthy();
    expect(screen.getByLabelText(/Yanıt seçenekleri, statik önizleme/)).toBeTruthy();
    expect(screen.getByText(/seçim yapılmaz ve yanıt değerlendirilmez/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kontrol Et' }).props.accessibilityState).toEqual({
      disabled: true,
    });

    fireEvent.press(screen.getByRole('button', { name: 'Kapat' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
