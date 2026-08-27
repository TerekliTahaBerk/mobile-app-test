import { tytSocialDraftBundle } from '@/modules/curriculum/content/tyt-social-draft-bundle';
import type { ContentBundle } from '@/modules/curriculum/domain/content-types';
import {
  assertValidContentBundle,
  ContentValidationError,
  validateContentBundle,
} from '@/modules/curriculum/domain/validate-content-bundle';

/** Structured clone that keeps the readonly contract out of the way in tests. */
function mutableCopy(bundle: ContentBundle): ContentBundle {
  return JSON.parse(JSON.stringify(bundle)) as ContentBundle;
}

function codesFrom(bundle: ContentBundle): readonly string[] {
  return validateContentBundle(bundle).map((issue) => issue.code);
}

/**
 * These tests deliberately corrupt a deep-cloned bundle to prove the validator
 * catches what the compiler cannot. This narrows a clone to a writable shape.
 */
function edit<T>(value: unknown): T {
  return value as T;
}

describe('content bundle validation', () => {
  it('accepts the shipped draft bundle', () => {
    expect(validateContentBundle(tytSocialDraftBundle)).toEqual([]);
    expect(assertValidContentBundle(tytSocialDraftBundle)).toBe(tytSocialDraftBundle);
  });

  it('keeps the shipped lesson marked draft until a human reviews it', () => {
    for (const lesson of tytSocialDraftBundle.lessons) {
      expect(lesson.provenance.reviewStatus).toBe('draft');
    }
    for (const exercise of tytSocialDraftBundle.exercises) {
      expect(exercise.provenance.reviewStatus).toBe('draft');
    }
  });

  it('rejects a duplicate stable id', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    const [first] = bundle.skills;
    edit<(typeof bundle.skills)[number][]>(bundle.skills).push({ ...first! });

    expect(codesFrom(bundle)).toContain('duplicateId');
  });

  it('rejects an exercise pointing at an unknown skill', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ skillIds: string[] }>(bundle.exercises[1]).skillIds = ['skill.does.not.exist'];

    const issues = validateContentBundle(bundle);
    expect(issues.map((issue) => issue.code)).toContain('brokenReference');
    expect(issues[0]?.message).toContain('skill.does.not.exist');
  });

  it('rejects a path node pointing at an unknown lesson', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ lessonId: string }>(bundle.pathNodes[0]).lessonId = 'lesson.nope';

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a lesson pointing at an unknown exercise', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ exerciseIds: string[] }>(bundle.lessons[0]).exerciseIds = ['exercise.nope'];

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a multiple choice whose correct option is not among its options', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    const mcq = bundle.exercises.find((exercise) => exercise.kind === 'multipleChoice')!;
    edit<{ correctOptionId: string }>(mcq).correctOptionId = 'opt-missing';

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a fill-blank solution token that is not in the bank', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    const blank = bundle.exercises.find((exercise) => exercise.kind === 'fillBlank')!;
    edit<{ solutionTokenIds: string[] }>(blank).solutionTokenIds = ['w-not-in-bank'];

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a matching exercise with ambiguous right-hand values', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    const matching = bundle.exercises.find((exercise) => exercise.kind === 'matching')!;
    const pairs = edit<{ pairs: { right: string }[] }>(matching).pairs;
    pairs[1]!.right = pairs[0]!.right;

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a scored exercise with no skill mapping', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ skillIds: string[] }>(bundle.exercises[1]).skillIds = [];

    expect(codesFrom(bundle)).toContain('emptyCollection');
  });

  it('rejects an exercise kind that has no approved renderer', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<unknown[]>(bundle.exercises).push({
      correctOrder: ['a', 'b'],
      difficulty: 2,
      explanation: 'demo',
      id: 'exercise.history.kurultay.001.order01',
      items: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      kind: 'ordering',
      prompt: 'Sırala',
      provenance: { author: 'test', reviewStatus: 'draft' },
      skillIds: [bundle.skills[0]!.id],
      tag: 'TARİH',
    });
    edit<{ exerciseIds: string[] }>(bundle.lessons[0]).exerciseIds.push(
      'exercise.history.kurultay.001.order01',
    );

    expect(codesFrom(bundle)).toContain('unsupportedExerciseKind');
  });

  it('rejects a node that lists itself as a prerequisite', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    const node = bundle.pathNodes[0]!;
    edit<{ prerequisiteIds: string[] }>(node).prerequisiteIds = [node.id];

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a schema version the app does not understand', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ schemaVersion: number }>(bundle).schemaVersion = 99;

    expect(codesFrom(bundle)).toContain('schemaVersionMismatch');
  });

  it('throws with every issue listed and actionable', () => {
    const bundle = mutableCopy(tytSocialDraftBundle);
    edit<{ skillIds: string[] }>(bundle.exercises[1]).skillIds = ['skill.nope'];

    expect(() => assertValidContentBundle(bundle)).toThrow(ContentValidationError);
    try {
      assertValidContentBundle(bundle);
    } catch (error) {
      const issues = (error as ContentValidationError).issues;
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]?.at).toMatch(/^exercises\[\d+\]/);
    }
  });
});
