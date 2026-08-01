import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import closed from '@ascua/surrealdb/decorators/closed';

module('Unit | Decorators | Closed', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      closed(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @closed decorator can only be applied to a Route'
      );
    }
  });
});
