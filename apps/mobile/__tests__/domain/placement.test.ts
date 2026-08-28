import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import { createContentIndex } from '@/modules/curriculum/domain/content-index';
import { isScoredKind } from '@/modules/curriculum/domain/content-types';
import { assemblePlacement } from '@/modules/learning/domain/placement';

const index = createContentIndex(tytDraftBundle);

/** The subtopic a question is filed under, as the diagnostic groups them. */
function topicOf(exerciseId: string): string {
  return index.getExerciseTaxonomy(exerciseId).subtopics[0]!.id;
}

describe('starting diagnostic', () => {
  it('stays inside one sitting and asks only scored questions', () => {
    const placement = assemblePlacement(index);

    expect(placement.exercises.length).toBeGreaterThanOrEqual(12);
    expect(placement.exercises.length).toBeLessThanOrEqual(20);
    expect(placement.topicIds.length).toBeGreaterThan(1);
    expect(placement.exercises.every((exercise) => isScoredKind(exercise.kind))).toBe(true);
    expect(new Set(placement.exercises.map((exercise) => exercise.id)).size).toBe(
      placement.exercises.length,
    );
  });

  it('samples every main topic and subtopic that has scored material', () => {
    const placement = assemblePlacement(index);
    const measurable = index.bundle.units
      .flatMap((unit) => unit.topicIds)
      .filter((topicId) => {
        const skillIds = new Set(index.getTopic(topicId).skillIds);
        return index.bundle.exercises.some(
          (exercise) =>
            isScoredKind(exercise.kind) &&
            exercise.skillIds.some((skillId) => skillIds.has(skillId)),
        );
      });

    expect([...placement.topicIds].sort()).toEqual([...measurable].sort());
    expect(
      new Set(placement.exercises.map((exercise) => index.getExerciseTaxonomy(exercise.id).mainTopic.id))
        .size,
    ).toBeGreaterThan(1);
  });

  it('gives every subtopic up to the evidence bar and never more', () => {
    const placement = assemblePlacement(index);
    const perTopic = new Map<string, number>();
    for (const exercise of placement.exercises) {
      const topicId = topicOf(exercise.id);
      perTopic.set(topicId, (perTopic.get(topicId) ?? 0) + 1);
    }

    // Three answers is the bar the topic report uses before it will label a
    // subtopic; nothing gets more, so no one subtopic can dominate the map.
    expect(Math.max(...perTopic.values())).toBeLessThanOrEqual(3);
    // A subtopic with thinner material contributes what it has, not nothing.
    expect(Math.min(...perTopic.values())).toBeGreaterThanOrEqual(1);
  });

  it('never asks the same subtopic twice in a row', () => {
    const topics = assemblePlacement(index).exercises.map((exercise) => topicOf(exercise.id));
    const runs = topics.filter((topic, position) => position > 0 && topic === topics[position - 1]);

    expect(runs).toHaveLength(0);
  });

  it('opens each subtopic with its most accessible question', () => {
    const placement = assemblePlacement(index);
    const firstPerTopic = new Map<string, number>();
    for (const exercise of placement.exercises) {
      const topicId = topicOf(exercise.id);
      if (!firstPerTopic.has(topicId)) {
        firstPerTopic.set(topicId, exercise.difficulty);
      }
    }
    const lastPerTopic = new Map<string, number>();
    for (const exercise of placement.exercises) {
      lastPerTopic.set(topicOf(exercise.id), exercise.difficulty);
    }

    for (const [topicId, first] of firstPerTopic) {
      expect(first).toBeLessThanOrEqual(lastPerTopic.get(topicId)!);
    }
  });

  it('is deterministic', () => {
    expect(assemblePlacement(index).exercises.map((exercise) => exercise.id)).toEqual(
      assemblePlacement(index).exercises.map((exercise) => exercise.id),
    );
  });

  it('refuses to invent a diagnostic when nothing is authored', () => {
    const empty = createContentIndex({ ...tytDraftBundle, exercises: [] });

    expect(() => assemblePlacement(empty)).toThrow(/Seviye tespiti/);
  });
});
