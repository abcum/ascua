import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Surreal', function (hooks) {
  setupTest(hooks);

  test.skip('sign up', async function () {
    const service = this.owner.lookup('service:surreal');

    await service.signup({
      NS: 'test',
      DB: 'test',
      SC: 'test',
      email: 'test@test.co',
      pass: 'pass',
    });
  });
});
