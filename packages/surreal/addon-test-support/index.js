import { waitUntil } from '@ember/test-helpers';

// Test support for `@ascua/surreal`, usable both by this addon's own tests
// and by consuming apps:
//
//   import { setupTest } from 'my-app/tests/helpers';
//   import { setupSurreal } from '@ascua/surreal/test-support';
//
//   module('store', function (hooks) {
//     setupTest(hooks);
//     setupSurreal(hooks, { reset: ['author', 'book'] });
//     test('...', async function (assert) {
//       await this.store.create('author', { name: 'Ada' });
//     });
//   });
//
// It assumes a SurrealDB server is reachable at the configured
// `surreal.uri` (the addon's own suite boots one via tests/surreal-server.mjs)
// and that the schema has already been applied.
//
// Options:
//   auth   - credentials passed to `surreal.signin` (default: root/root)
//   reset  - table names to clear (DELETE) before each test, for isolation

export function setupSurreal(hooks, options = {}) {
	const auth = options.auth || { username: 'root', password: 'root' };
	const reset = options.reset || [];

	hooks.beforeEach(async function () {
		// Start each test from a clean auth state so the service does not
		// boot with a token left in localStorage by a previous test.
		if (window.localStorage) window.localStorage.removeItem('surreal');

		this.surreal = this.owner.lookup('service:surreal');
		this.store = this.owner.lookup('service:store');

		// The service connects on instantiation; wait for the initial
		// (token-less) authentication attempt to settle before signing in.
		await waitUntil(() => this.surreal.attempted, { timeout: 15000 });

		await this.surreal.signin(auth);

		if (reset.length) {
			await this.surreal.query(reset.map((t) => `DELETE ${t};`).join(' '));
		}
	});

	hooks.afterEach(async function () {
		try {
			await this.surreal.invalidate();
		} catch (e) {
			// ignore — connection may already be torn down
		}
	});
}

export default setupSurreal;
