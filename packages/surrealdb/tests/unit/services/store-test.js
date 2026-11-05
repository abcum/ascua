import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Store', function (hooks) {
  setupTest(hooks);

  test('store is ready', async function () {
    this.owner.lookup('service:store');
  });
});
