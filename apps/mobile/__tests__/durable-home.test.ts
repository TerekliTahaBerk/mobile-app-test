import {
  KURULTAY_LESSON_ID,
  KURULTAY_PATH_NODE_ID,
} from '@/modules/curriculum/content/tyt-social-draft-bundle';
import { buildDurableHomeViewModel } from '@/modules/home/model/home-view-model';

describe('durable production home model', () => {
  it('uses ledger/İz input and locks every preview node on a fresh install', () => {
    const model = buildDurableHomeViewModel({
      iz: 0,
      progress: null,
      recommendation: {
        kind: 'lesson',
        lessonId: KURULTAY_LESSON_ID,
        pathNodeId: KURULTAY_PATH_NODE_ID,
        reason: 'newLesson',
      },
      totalXp: 0,
    });

    expect(model.hud).toEqual({ mode: 'TYT', trace: '0', xp: '0 XP' });
    expect(model.nodes.filter((node) => node.source === 'preview')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ state: 'locked', status: 'Önizleme' }),
      ]),
    );
  });

  it('shows persisted completion without unlocking preview curriculum', () => {
    const model = buildDurableHomeViewModel({
      iz: 1,
      progress: {
        completionCount: 1,
        firstCompletedAt: '2026-08-27T10:00:00.000Z',
        lastCompletedAt: '2026-08-27T10:00:00.000Z',
        pathNodeId: KURULTAY_PATH_NODE_ID,
        status: 'completed',
      },
      recommendation: { kind: 'none', reason: 'newLesson' },
      totalXp: 85,
    });

    expect(model.nodes.find((node) => node.id === KURULTAY_PATH_NODE_ID)).toMatchObject({
      state: 'complete',
      status: 'Tamamlandı',
    });
    expect(model.currentLevel.cta).toBe('TEKRARLA');
    expect(model.hud).toMatchObject({ trace: '1', xp: '85 XP' });
    expect(model.nodes.filter((node) => node.source === 'preview').every((node) => node.state === 'locked')).toBe(true);
  });
});
