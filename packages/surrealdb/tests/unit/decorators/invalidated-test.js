import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import invalidated from '@ascua/surrealdb/decorators/invalidated';

module('Unit | Decorators | Invalidated', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      invalidated(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @invalidated decorator can only be applied to a Route'
      );
    }
  });
});
