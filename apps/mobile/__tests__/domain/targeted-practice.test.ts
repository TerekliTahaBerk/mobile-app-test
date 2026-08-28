import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { isScoredKind } from '@/modules/curriculum/domain/content-types';
import { assembleTargetedPractice } from '@/modules/learning/domain/targeted-practice';

describe('targeted subtopic practice', () => {
  it('assembles at most five scored questions from only the selected subtopic', () => {
    const index = createContentIndex(tytDraftBundle);
    const topicId = 'tyt.history.first-turkish-states.states';
    const practice = assembleTargetedPractice(topicId, index);
    const topicSkills = new Set(index.getTopic(topicId).skillIds);

    expect(practice.exercises.length).toBeGreaterThan(0);
    expect(practice.exercises.length).toBeLessThanOrEqual(5);
    expect(practice.lesson.title).toContain('Hedefli Çalışma');
    expect(
      practice.exercises.every(
        (exercise) =>
          isScoredKind(exercise.kind) &&
          exercise.skillIds.some((skillId) => topicSkills.has(skillId)),
      ),
    ).toBe(true);
  });

  it('is deterministic and respects an explicit question limit', () => {
    const index = createContentIndex(tytDraftBundle);
    const topicId = 'tyt.history.first-turkish-states.kurultay';

    const first = assembleTargetedPractice(topicId, index, 2);
    const second = assembleTargetedPractice(topicId, index, 2);

    expect(first.exercises.map((exercise) => exercise.id)).toEqual(
      second.exercises.map((exercise) => exercise.id),
    );
    expect(first.exercises).toHaveLength(2);
  });
});
