import assert from 'node:assert/strict';
import { test } from 'node:test';

import { unitPathFor } from '../content-api.ts';

/**
 * The write guard. A path arriving over HTTP is input even when the server is
 * local, so these are the cases that must never resolve to a file.
 */

test('resolves a real unit id inside the content directory', () => {
  const path = unitPathFor('tyt.history.time-and-history');

  assert.match(path, /content\/data\/units\/tyt\.history\.time-and-history\.json$/);
});

test('refuses a traversal that would escape the content directory', () => {
  assert.throws(() => unitPathFor('../../../../etc/passwd'), /Geçersiz ünite kimliği/);
  assert.throws(() => unitPathFor('..'), /Geçersiz ünite kimliği/);
  assert.throws(() => unitPathFor('a/b'), /Geçersiz ünite kimliği/);
});

test('refuses an id that is not one', () => {
  assert.throws(() => unitPathFor(''), /Geçersiz ünite kimliği/);
  assert.throws(() => unitPathFor('Tyt.History'), /Geçersiz ünite kimliği/);
  assert.throws(() => unitPathFor(`x${'y'.repeat(200)}`), /Geçersiz ünite kimliği/);
});
