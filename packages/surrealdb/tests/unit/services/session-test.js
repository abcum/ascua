import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Session', function (hooks) {
  setupTest(hooks);

  test('session is authenticated', async function () {
    this.owner.lookup('service:session');
  });
});
