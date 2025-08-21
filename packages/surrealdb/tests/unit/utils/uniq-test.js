import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import uniq from '@ascua/surrealdb/utils/uniq';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

module('Unit | Utils | Uniq', function (hooks) {
  setupTest(hooks);

  test('Returns a string of the correct length', function (assert) {
    const result = uniq(64);
    assert.equal(result.length, 64);
  });

  test('Returns a string of random characters', function (assert) {
    assert.expect(64);

    const result = uniq(64);
    for (let i = 0; i < result.length; i++) {
      assert.ok(chars.includes(result[i]));
    }
  });

  test('Returns a different string each time it is called', function (assert) {
    const result1 = uniq(64);
    const result2 = uniq(64);
    assert.notEqual(result1, result2);
  });
});
