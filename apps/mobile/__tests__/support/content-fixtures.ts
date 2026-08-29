import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
import type { ExerciseId } from '@/modules/curriculum/domain/content-types';

/**
 * Asserts a fixture points at real authored content.
 *
 * Reporting deliberately ignores attempts whose exercise has left the bundle,
 * so a typo in a fixture id is silently dropped and its test passes without
 * measuring anything. Fixtures go through here so that mistake fails loudly.
 */
export function authoredExercise(id: string): ExerciseId {
  if (!tytDraftBundle.exercises.some((exercise) => exercise.id === id)) {
    throw new Error(`Test fixture, pakette olmayan bir alıştırmaya işaret ediyor: "${id}".`);
  }

  return id as ExerciseId;
}
