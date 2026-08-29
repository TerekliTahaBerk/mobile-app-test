import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  exerciseIdFor,
  lessonIdFor,
  newExercise,
  pathNodeIdFor,
  rechainPath,
  reorder,
  skillIdFor,
  slugify,
  topicIdFor,
  uniqueId,
  unitIdFor,
} from '../src/model/authoring.ts';

const none = new Set<string>();

test('turns a Turkish title into an id-safe slug', () => {
  assert.equal(slugify('Osmanlı Kuruluşu'), 'osmanli-kurulusu');
  assert.equal(slugify('İlk Türk Devletleri'), 'ilk-turk-devletleri');
  assert.equal(slugify('Çağlar ve Dönemler'), 'caglar-ve-donemler');
  // Never empty: an id has to exist even when the title is only punctuation.
  assert.equal(slugify('!!!'), 'yeni');
});

test('never reuses an id that already exists', () => {
  const taken = new Set(['tyt.history.kurulus', 'tyt.history.kurulus-2']);

  assert.equal(uniqueId('tyt.history.kurulus', taken), 'tyt.history.kurulus-3');
  assert.equal(uniqueId('tyt.history.baska', taken), 'tyt.history.baska');
});

test('derives ids from the parent so the hierarchy reads in the id', () => {
  const unitId = unitIdFor('tyt.history', 'Osmanlı Kuruluşu', none);
  const topicId = topicIdFor(unitId, 'Beylikten Devlete', none);
  const skillId = skillIdFor(topicId, 'Kuruluş koşulları', none);

  assert.equal(unitId, 'tyt.history.osmanli-kurulusu');
  assert.equal(topicId, 'tyt.history.osmanli-kurulusu.beylikten-devlete');
  assert.match(skillId, /^skill\./);
});

test('numbers lessons and questions within their parent', () => {
  const topicId = 'tyt.history.osmanli-kurulusu.beylikten-devlete';
  const first = lessonIdFor(topicId, none);
  const second = lessonIdFor(topicId, new Set([first]));

  assert.match(first, /\.001$/);
  assert.match(second, /\.002$/);

  const question = exerciseIdFor(first, 'multipleChoice', none);
  assert.match(question, /^exercise\..*\.mcq01$/);
  assert.match(exerciseIdFor(first, 'multipleChoice', new Set([question])), /\.mcq02$/);
});

test('pads path node ids so they sort in order', () => {
  assert.equal(pathNodeIdFor('tyt.history.osmanli-kurulusu', 2), 'path.osmanli-kurulusu.02');
  assert.equal(pathNodeIdFor('tyt.history.osmanli-kurulusu', 11), 'path.osmanli-kurulusu.11');
});

test('creates a complete question of every kind, not a broken one', () => {
  const kinds = [
    'fillBlank',
    'flashcard',
    'matching',
    'multipleChoice',
    'ordering',
    'trueFalse',
  ] as const;

  for (const kind of kinds) {
    const exercise = newExercise({ id: `e.${kind}`, kind, skillId: 's1', tag: 'TARİH' });

    // A half-formed record would stop the whole bundle from parsing and take
    // the rest of the tool down with it.
    assert.equal(exercise.kind, kind);
    assert.deepEqual(exercise.skillIds, ['s1']);
    assert.equal(typeof exercise.explanation, 'string');
    assert.equal(exercise.difficulty, 2);
    assert.equal(
      (exercise.provenance as { reviewStatus: string }).reviewStatus,
      'draft',
      'new content is always draft',
    );
  }
});

test('points a new multiple choice at a real option', () => {
  const exercise = newExercise({
    id: 'e1',
    kind: 'multipleChoice',
    skillId: 's1',
    tag: 'TARİH',
  });
  const optionIds = (exercise.options as { id: string }[]).map((option) => option.id);

  assert.ok(optionIds.includes(exercise.correctOptionId as string));
});

test('moves a question one place and refuses to move it off the ends', () => {
  const ids = ['a', 'b', 'c'];

  assert.deepEqual(reorder(ids, 'b', -1), ['b', 'a', 'c']);
  assert.deepEqual(reorder(ids, 'b', 1), ['a', 'c', 'b']);
  assert.deepEqual(reorder(ids, 'a', -1), ids);
  assert.deepEqual(reorder(ids, 'c', 1), ids);
  assert.deepEqual(reorder(ids, 'yok', 1), ids);
});

test('rebuilds the path into one chain after a step is removed', () => {
  const remaining = [
    { id: 'path.x.01', order: 1, prerequisiteIds: [] },
    // The second step was deleted, so the third now follows the first.
    { id: 'path.x.03', order: 3, prerequisiteIds: ['path.x.02'] },
    { id: 'path.x.04', order: 4, prerequisiteIds: ['path.x.03'] },
  ];

  assert.deepEqual(rechainPath(remaining), [
    { id: 'path.x.01', order: 1, prerequisiteIds: [] },
    { id: 'path.x.03', order: 2, prerequisiteIds: ['path.x.01'] },
    { id: 'path.x.04', order: 3, prerequisiteIds: ['path.x.03'] },
  ]);
});

test('renumbers from the order it is given, never from the old one', () => {
  // Reordering hands the nodes over already moved. Re-sorting by the stale
  // `order` here would silently undo the move that called it.
  const chained = rechainPath([
    { id: 'path.x.03', order: 3, prerequisiteIds: ['path.x.02'] },
    { id: 'path.x.01', order: 1, prerequisiteIds: [] },
  ]);

  assert.deepEqual(chained, [
    { id: 'path.x.03', order: 1, prerequisiteIds: [] },
    { id: 'path.x.01', order: 2, prerequisiteIds: ['path.x.03'] },
  ]);
});

test('keeps node ids when rechaining, because progress points at them', () => {
  const chained = rechainPath([
    { id: 'path.x.02', order: 2, prerequisiteIds: [] },
    { id: 'path.x.07', order: 7, prerequisiteIds: ['path.x.05'] },
  ]);

  assert.deepEqual(
    chained.map((node) => node.id),
    ['path.x.02', 'path.x.07'],
  );
});
