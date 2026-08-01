import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import Route from '@ember/routing/route';
import attempted from '@ascua/surrealdb/decorators/attempted';

module('Unit | Decorators | Attempted', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  class MyRoute extends Route {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(2);
    try {
      attempted(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @attempted decorator can only be applied to a Route'
      );

      assert.notOk(MyClass.prototype.beforeModel);
    }
  });

  test('should add a beforeModel method that waits for authentication', function (assert) {
    attempted(MyRoute);

    assert.ok(MyRoute.prototype.beforeModel);
  });
});
