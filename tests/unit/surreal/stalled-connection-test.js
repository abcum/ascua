import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { attempts } from '@ascua/surreal/services/surreal';

// A socket that never opens must not hold the app on a blank screen: wait()
// has to give up after the timeout and leave the service signed out.

module('Unit | surreal | stalled connection', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.timeout = attempts.timeout;
		attempts.timeout = 50;
		this.surreal = this.owner.lookup('service:surreal');
	});

	hooks.afterEach(function () {
		attempts.timeout = this.timeout;
	});

	test('wait gives up on a socket that never opens and marks the service signed out', async function (assert) {
		if (this.surreal.opened) {
			assert.ok(true, 'the socket is open, so there is nothing to time out');
			return;
		}

		await this.surreal.wait();

		assert.true(this.surreal.attempted, 'the attempt is settled');
		assert.true(this.surreal.invalidated, 'the service is marked signed out');
	});
});
