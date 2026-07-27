import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';

// A `storage` event fires in every tab EXCEPT the one that wrote, and the
// surreal service both listens for it and writes the token back inside
// authenticate(). With two tabs open on the same origin that closes a cycle:
// tab A writes, tab B hears it and authenticates, tab B writes, tab A hears it
// and authenticates, forever, one `authenticate` RPC per lap.
//
// Measured in the real app before the guard: 102,544 authenticate messages on
// the socket during a single page load with two tabs open. The connection is
// then so far behind that ordinary queries never get a response — the app looks
// like it has hung rather than like it is slow — and the server pins a core.
// With one tab open the cycle cannot start, which is why it comes and goes.
//
// This test drives the listener directly rather than opening two tabs: a
// StorageEvent carrying the token the service already holds is exactly what the
// second tab receives on every lap, and it must not provoke another
// authenticate.

module('Unit | surreal | cross-tab auth', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.surreal = this.owner.lookup('service:surreal');

		// Count authenticate calls without touching the network.
		this.calls = [];
		this.surreal.authenticate = (t) => {
			this.calls.push(t);
			return Promise.resolve();
		};
	});

	const fire = (newValue) =>
		window.dispatchEvent(
			new StorageEvent('storage', { key: 'surreal', newValue }),
		);

	test('a storage event carrying the token we already hold is ignored', function (assert) {
		this.surreal.token = 'token-abc';

		fire('token-abc');

		assert.deepEqual(
			this.calls,
			[],
			'no re-authentication, so the cross-tab cycle cannot start',
		);
	});

	test('a storage event carrying a different token still re-authenticates', function (assert) {
		this.surreal.token = 'token-abc';

		fire('token-xyz');

		assert.deepEqual(
			this.calls,
			['token-xyz'],
			'a genuine change from another tab is still honoured',
		);
	});

	test('a storage event clearing the token still re-authenticates', function (assert) {
		// Signing out in another tab removes the key, so newValue is null and
		// must be acted on — that is how this tab learns it has been signed out.
		this.surreal.token = 'token-abc';

		fire(null);

		assert.deepEqual(this.calls, [null], 'a sign-out elsewhere propagates');
	});

	test('an unrelated storage key is ignored', function (assert) {
		this.surreal.token = 'token-abc';

		window.dispatchEvent(
			new StorageEvent('storage', { key: 'something-else', newValue: 'x' }),
		);

		assert.deepEqual(this.calls, [], 'only the surreal key matters');
	});

	test('repeated identical storage events never accumulate calls', function (assert) {
		// The failure mode was unbounded, so assert on a run rather than one event.
		this.surreal.token = 'token-abc';

		for (let i = 0; i < 50; i++) fire('token-abc');

		assert.strictEqual(
			this.calls.length,
			0,
			'50 identical events produce 0 authenticate calls',
		);
	});
});
