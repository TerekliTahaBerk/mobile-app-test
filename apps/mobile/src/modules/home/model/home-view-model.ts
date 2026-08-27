import { getContentIndex } from '@/modules/curriculum/content/content-source';
import {
  FIRST_TURKISH_STATES_UNIT_ID,
  KURULTAY_PATH_NODE_ID,
} from '@/modules/curriculum/content/tyt-social-draft-bundle';
import type { LessonId, PathNodeId } from '@/modules/curriculum/domain/content-types';
import type { CizgiMood } from '@/shared/ui/cizgi/cizgi-assets';
import type { SubjectKey } from '@/shared/ui/theme/tokens';

/**
 * The home path view model.
 *
 * One node on this path is REAL: it comes from the validated content bundle and
 * opens an actual lesson. Everything around it is PREVIEW_ONLY — placeholder
 * levels that keep the approved composition intact while the curriculum is
 * still one topic wide. The two are tagged so nothing pretends to be content it
 * is not, and preview nodes are not openable.
 */

export type PathNodeState =
  | 'available'
  | 'checkpoint'
  | 'complete'
  | 'current'
  | 'locked'
  | 'review';

export type PathNodeSource = 'preview' | 'real';

export type PathNodeView = {
  detail: string;
  id: PathNodeId;
  /** Present only on real nodes; preview nodes cannot be opened. */
  readonly lessonId?: LessonId;
  source: PathNodeSource;
  state: PathNodeState;
  /** Visible, non-colour status word. */
  status: string;
  title: string;
};

export type CurrentLevelView = {
  cta: string;
  meta: string;
  nodeId: PathNodeId;
  title: string;
};

export type HomeViewModel = {
  companion: { accessibilityLabel: string; mood: CizgiMood };
  currentLevel: CurrentLevelView;
  hud: { gems: string; hearts: string; level: string; mode: string; trace: string };
  nodes: readonly PathNodeView[];
  unit: { eyebrow: string; subject: SubjectKey; title: string };
};

/**
 * HUD counters stay preview values: XP, gems, hearts, and İz all need durable
 * progress, which is Milestone 6. Nothing here is computed.
 */
const PREVIEW_HUD = {
  gems: '527',
  hearts: '4',
  level: '14',
  mode: 'TYT',
  trace: '13',
} as const;

const PREVIEW_NODES_BEFORE: readonly PathNodeView[] = [
  {
    detail: 'Bölüm 1 kontrol noktası · önizleme',
    id: 'preview.first-turkish-states.checkpoint',
    source: 'preview',
    state: 'checkpoint',
    status: 'Tamamlandı',
    title: 'Bölüm 1 rozeti',
  },
  {
    detail: 'Önizleme içeriği',
    id: 'preview.first-turkish-states.01',
    source: 'preview',
    state: 'complete',
    status: 'Tamamlandı',
    title: 'Türklerde devlet',
  },
  {
    detail: 'Önizleme içeriği',
    id: 'preview.first-turkish-states.02',
    source: 'preview',
    state: 'complete',
    status: 'Tamamlandı',
    title: 'Kut ve veraset',
  },
];

const PREVIEW_NODES_AFTER: readonly PathNodeView[] = [
  {
    detail: 'Önceki ders bitince açılır',
    id: 'preview.first-turkish-states.04',
    source: 'preview',
    state: 'locked',
    status: 'Kilitli',
    title: 'Töre',
  },
  {
    detail: 'Önceki ders bitince açılır',
    id: 'preview.first-turkish-states.05',
    source: 'preview',
    state: 'locked',
    status: 'Kilitli',
    title: 'Mini tekrar',
  },
];

/** Builds the home view model, splicing the one real node into the preview path. */
export function buildHomeViewModel(): HomeViewModel {
  const index = getContentIndex();
  const unit = index.getUnit(FIRST_TURKISH_STATES_UNIT_ID);
  const subject = index.getSubjectOfUnit(unit.id);
  const realNode = index
    .getUnitPath(unit.id)
    .find((node) => node.id === KURULTAY_PATH_NODE_ID);

  if (realNode?.lessonId === undefined) {
    throw new Error('Gerçek yol düğümü içerik paketinde bulunamadı.');
  }

  const lesson = index.getLesson(realNode.lessonId);
  const current: PathNodeView = {
    detail: `${lesson.exerciseIds.length} alıştırma · ~${lesson.estimatedMinutes} dk`,
    id: realNode.id,
    lessonId: realNode.lessonId,
    source: 'real',
    state: 'current',
    status: 'Şimdi',
    title: lesson.title,
  };

  return {
    companion: { accessibilityLabel: 'ÇİZGİ seni yolda bekliyor', mood: 'happy' },
    currentLevel: {
      cta: 'BAŞLA',
      meta: `${lesson.exerciseIds.length} alıştırma · ~${lesson.estimatedMinutes} dk`,
      nodeId: realNode.id,
      title: lesson.title,
    },
    hud: PREVIEW_HUD,
    nodes: [...PREVIEW_NODES_BEFORE, current, ...PREVIEW_NODES_AFTER],
    unit: {
      eyebrow: `ÜNİTE 1 · ${subject.title.toLocaleUpperCase('tr-TR')}`,
      subject: 'history',
      title: unit.title,
    },
  };
}
