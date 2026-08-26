import { render, screen } from '@testing-library/react-native';

import { homePreviewData } from '@/modules/home/model/home-preview-data';
import { LearningPathPreview } from '@/modules/home/ui/learning-path-preview';

describe('learning path preview', () => {
  it('renders the trace metaphor, the current-step callout, and non-color locked semantics', async () => {
    await render(
      <LearningPathPreview
        steps={homePreviewData.pathSteps}
        subject={homePreviewData.subject}
        unit={homePreviewData.unit}
      />,
    );

    // Unit context uses the History subject identity.
    expect(screen.getByText('ÜNİTE 3 · TARİH')).toBeTruthy();
    expect(screen.getByText('Osmanlı’da Yenileşme')).toBeTruthy();

    // The current step is the strongest state and surfaces the "BAŞLA" callout.
    expect(screen.getByText('BAŞLA', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByLabelText(/Tanzimat’a giriş\. Şimdi\./)).toBeTruthy();

    // Locked semantics do not rely on color alone; status text is present.
    expect(screen.getByLabelText(/Kısa tekrar\. Kilitli\./)).toBeTruthy();
    expect(screen.getByText('KİLİTLİ', { includeHiddenElements: true })).toBeTruthy();

    // The checkpoint remains a distinct, labelled state.
    expect(screen.getByLabelText(/Ünite sınavı\. Kontrol noktası\./)).toBeTruthy();
  });
});
