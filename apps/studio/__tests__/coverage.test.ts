import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCoverage, summaryOf } from '../src/model/coverage.ts';

/** A unit with one measured skill and one that nothing asks about. */
const snapshot = {
  curriculum: {
    contentVersion: '0',
    curriculumVersion: '0',
    exams: [],
    locale: 'tr-TR',
    schemaVersion: 2,
    subjects: [],
    units: [],
  },
  units: [
    {
      concepts: [],
      exercises: [
        {
          difficulty: 2,
          id: 'e1',
          kind: 'multipleChoice',
          prompt: 'Soru bir',
          provenance: { reviewStatus: 'draft' },
          skillIds: ['s1'],
        },
        {
          difficulty: 2,
          id: 'e2',
          kind: 'flashcard',
          provenance: { reviewStatus: 'reviewed' },
          skillIds: ['s1'],
        },
      ],
      lessons: [],
      pathNodes: [],
      skills: [
        { id: 's1', title: 'Ölçülen', topicId: 't1' },
        { id: 's2', title: 'Ölçülmeyen', topicId: 't1' },
      ],
      topics: [{ id: 't1', title: 'Alt konu' }],
      unitId: 'unit.one',
    },
  ],
};

test('counts questions per skill and separates the scored ones', () => {
  const [unit] = buildCoverage(snapshot);
  const measured = unit?.skills.find((skill) => skill.skillId === 's1');

  // The flashcard counts as a question but not as a measurement: it is
  // self-reported and never marked right or wrong.
  assert.equal(measured?.exercises, 2);
  assert.equal(measured?.scored, 1);
  assert.equal(measured?.topicTitle, 'Alt konu');
});

test('names the skills nothing asks about', () => {
  const [unit] = buildCoverage(snapshot);

  assert.equal(unit?.unmeasuredSkills, 1);
  assert.equal(unit?.skills.find((skill) => skill.skillId === 's2')?.exercises, 0);
});

test('reports the review split the unit actually has', () => {
  const [unit] = buildCoverage(snapshot);

  assert.deepEqual(
    { approved: unit?.approved, draft: unit?.draft, reviewed: unit?.reviewed },
    { approved: 0, draft: 1, reviewed: 1 },
  );
});

test('spreads questions across the difficulty scale', () => {
  const [unit] = buildCoverage(snapshot);

  assert.deepEqual(unit?.skills[0]?.byDifficulty, [0, 2, 0, 0, 0]);
});

test('identifies a question by what it asks, not by its id', () => {
  assert.equal(summaryOf({ id: 'e1', prompt: 'Soru bir' }), 'Soru bir');
  assert.equal(summaryOf({ cards: [{ front: 'Kut' }, { front: 'Töre' }], id: 'e2' }), 'Kut · Töre');
  assert.equal(summaryOf({ id: 'e3' }), 'e3');
});
