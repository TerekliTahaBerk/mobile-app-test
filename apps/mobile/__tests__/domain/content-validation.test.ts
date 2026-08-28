import { tytDraftBundle } from '@/modules/curriculum/content/tyt-draft-bundle';
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
    expect(validateContentBundle(tytDraftBundle)).toEqual([]);
    expect(assertValidContentBundle(tytDraftBundle)).toBe(tytDraftBundle);
  });

  it('keeps the shipped lesson marked draft until a human reviews it', () => {
    for (const lesson of tytDraftBundle.lessons) {
      expect(lesson.provenance.reviewStatus).toBe('draft');
    }
    for (const exercise of tytDraftBundle.exercises) {
      expect(exercise.provenance.reviewStatus).toBe('draft');
    }
  });

  it('rejects a duplicate stable id', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const [first] = bundle.skills;
    edit<(typeof bundle.skills)[number][]>(bundle.skills).push({ ...first! });

    expect(codesFrom(bundle)).toContain('duplicateId');
  });

  it('rejects an exercise pointing at an unknown skill', () => {
    const bundle = mutableCopy(tytDraftBundle);
    edit<{ skillIds: string[] }>(bundle.exercises[1]).skillIds = ['skill.does.not.exist'];

    const issues = validateContentBundle(bundle);
    expect(issues.map((issue) => issue.code)).toContain('brokenReference');
    expect(issues[0]?.message).toContain('skill.does.not.exist');
  });

  it('rejects a path node pointing at an unknown lesson', () => {
    const bundle = mutableCopy(tytDraftBundle);
    edit<{ lessonId: string }>(bundle.pathNodes[0]).lessonId = 'lesson.nope';

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a lesson pointing at an unknown exercise', () => {
    const bundle = mutableCopy(tytDraftBundle);
    edit<{ exerciseIds: string[] }>(bundle.lessons[0]).exerciseIds = ['exercise.nope'];

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a multiple choice whose correct option is not among its options', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const mcq = bundle.exercises.find((exercise) => exercise.kind === 'multipleChoice')!;
    edit<{ correctOptionId: string }>(mcq).correctOptionId = 'opt-missing';

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a fill-blank solution token that is not in the bank', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const blank = bundle.exercises.find((exercise) => exercise.kind === 'fillBlank')!;
    edit<{ solutionTokenIds: string[] }>(blank).solutionTokenIds = ['w-not-in-bank'];

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a matching exercise with ambiguous right-hand values', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const matching = bundle.exercises.find((exercise) => exercise.kind === 'matching')!;
    const pairs = edit<{ pairs: { right: string }[] }>(matching).pairs;
    pairs[1]!.right = pairs[0]!.right;

    expect(codesFrom(bundle)).toContain('invalidAnswer');
  });

  it('rejects a scored exercise with no skill mapping', () => {
    const bundle = mutableCopy(tytDraftBundle);
    edit<{ skillIds: string[] }>(bundle.exercises[1]).skillIds = [];

    expect(codesFrom(bundle)).toContain('emptyCollection');
  });

  it('rejects a question whose skills cross main-topic boundaries', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const firstExercise = bundle.exercises.find((exercise) => exercise.skillIds.length > 0)!;
    const firstSkill = bundle.skills.find((skill) => skill.id === firstExercise.skillIds[0])!;
    const firstTopic = bundle.topics.find((topic) => topic.id === firstSkill.topicId)!;
    const otherSkill = bundle.skills.find((skill) => {
      const topic = bundle.topics.find((candidate) => candidate.id === skill.topicId);
      return topic?.unitId !== firstTopic.unitId;
    })!;

    edit<{ skillIds: string[] }>(firstExercise).skillIds = [firstSkill.id, otherSkill.id];

    expect(codesFrom(bundle)).toContain('invalidTaxonomy');
  });

  it('keeps a contracted-but-unrendered exercise kind out of a lesson', () => {
    // Every kind in the contract has a renderer today. The guard exists for the
    // next one: a kind may be authored and stored before a screen exists, but
    // it must not reach a learner until one does.
    const bundle = mutableCopy(tytDraftBundle);
    edit<unknown[]>(bundle.exercises).push({
      difficulty: 2,
      explanation: 'demo',
      id: 'exercise.history.states.001.future01',
      kind: 'numericEntry',
      prompt: 'Kaç?',
      provenance: { author: 'test', reviewStatus: 'draft' },
      skillIds: [bundle.skills[0]!.id],
      tag: 'TARİH',
    });
    edit<{ exerciseIds: string[] }>(bundle.lessons[0]).exerciseIds.push(
      'exercise.history.states.001.future01',
    );

    expect(codesFrom(bundle)).toContain('unsupportedExerciseKind');
  });

  it('rejects a node that lists itself as a prerequisite', () => {
    const bundle = mutableCopy(tytDraftBundle);
    const node = bundle.pathNodes[0]!;
    edit<{ prerequisiteIds: string[] }>(node).prerequisiteIds = [node.id];

    expect(codesFrom(bundle)).toContain('brokenReference');
  });

  it('rejects a schema version the app does not understand', () => {
    const bundle = mutableCopy(tytDraftBundle);
    edit<{ schemaVersion: number }>(bundle).schemaVersion = 99;

    expect(codesFrom(bundle)).toContain('schemaVersionMismatch');
  });

  it('throws with every issue listed and actionable', () => {
    const bundle = mutableCopy(tytDraftBundle);
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
