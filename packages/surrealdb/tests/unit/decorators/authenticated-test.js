import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import authenticated from '@ascua/surrealdb/decorators/authenticated';

module('Unit | Decorators | Authenticated', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      authenticated(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @authenticated decorator can only be applied to a Route'
      );
    }
  });
});
