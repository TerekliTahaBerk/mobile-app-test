import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';
import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * How a node on the learning path presents itself. These are view states only.
 * Unlocking, review scheduling, and checkpoint rules are learning-system
 * concerns and are not modelled here.
 */
export type PathNodeState =
  | 'available'
  | 'checkpoint'
  | 'complete'
  | 'current'
  | 'locked'
  | 'review';

export type PathNode = {
  /** Short accessible description of what the node contains. */
  detail: string;
  id: string;
  state: PathNodeState;
  /** Visible, non-colour status word — locked/current are never colour-only. */
  status: string;
  title: string;
};

export type CurrentLevelPreview = {
  cta: string;
  meta: string;
  nodeId: string;
  title: string;
};

export type HomePreviewViewModel = {
  companion: { accessibilityLabel: string; mood: CizgiMood };
  currentLevel: CurrentLevelPreview;
  hud: {
    gems: string;
    hearts: string;
    level: string;
    mode: string;
    trace: string;
  };
  nodes: readonly PathNode[];
  unit: {
    eyebrow: string;
    subject: SubjectKey;
    title: string;
  };
};

// Presentation-only demo data taken from the approved design. It is
// deliberately not a curriculum, exercise, XP, mastery, or persistence
// contract, and must not be reused as one.
export const homePreviewData = {
  companion: { accessibilityLabel: 'ÇİZGİ seni yolda bekliyor', mood: 'happy' },
  currentLevel: {
    cta: 'BAŞLA',
    meta: 'Ders 2 / 5 · +20 XP',
    nodeId: 'node-tanzimat-fermani',
    title: 'Tanzimat Fermanı',
  },
  hud: {
    gems: '527',
    hearts: '4',
    level: '14',
    mode: 'TYT',
    trace: '13',
  },
  nodes: [
    {
      detail: 'Bölüm 1 kontrol noktası',
      id: 'node-bolum-1-kontrol',
      state: 'checkpoint',
      status: 'Tamamlandı',
      title: 'Bölüm 1 rozeti',
    },
    {
      detail: 'Değişimin ilk adımları',
      id: 'node-degisimin-ilk-adimlari',
      state: 'complete',
      status: 'Tamamlandı',
      title: 'Değişimin ilk adımları',
    },
    {
      detail: 'Lale Devri',
      id: 'node-lale-devri',
      state: 'complete',
      status: 'Tamamlandı',
      title: 'Lale Devri',
    },
    {
      detail: 'Ders 2 / 5 · +20 XP',
      id: 'node-tanzimat-fermani',
      state: 'current',
      status: 'Şimdi',
      title: 'Tanzimat Fermanı',
    },
    {
      detail: 'Önceki ders bitince açılır',
      id: 'node-islahat-fermani',
      state: 'locked',
      status: 'Kilitli',
      title: 'Islahat Fermanı',
    },
    {
      detail: 'Önceki ders bitince açılır',
      id: 'node-birinci-mesrutiyet',
      state: 'locked',
      status: 'Kilitli',
      title: 'I. Meşrutiyet',
    },
  ],
  unit: {
    eyebrow: 'BÖLÜM 2, ÜNİTE 3 · TARİH',
    subject: 'history',
    title: 'Osmanlı’da yenileşme',
  },
} as const satisfies HomePreviewViewModel;
