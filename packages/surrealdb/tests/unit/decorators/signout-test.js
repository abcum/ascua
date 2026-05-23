import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import signout from '@ascua/surrealdb/decorators/signout';

module('Unit | Decorators | Signout', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      signout(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @signout decorator can only be applied to a Route'
      );
    }
  });
});
