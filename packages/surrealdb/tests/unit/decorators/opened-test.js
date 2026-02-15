import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import opened from '@ascua/surrealdb/decorators/opened';

module('Unit | Decorators | Opened', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      opened(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @opened decorator can only be applied to a Route'
      );
    }
  });
});
