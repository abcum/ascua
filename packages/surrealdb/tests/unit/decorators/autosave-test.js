import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import autosave from '@ascua/surrealdb/decorators/autosave';

module('Unit | Decorators | Autosave', function (hooks) {
  setupTest(hooks);

  class MyClass {}

  test('should only be applied to a Route class', function (assert) {
    assert.expect(1);
    try {
      autosave(MyClass);
    } catch (e) {
      assert.equal(
        e.message,
        'Assertion Failed: The @autosave decorator can only be applied to a Model'
      );
    }
  });
});
