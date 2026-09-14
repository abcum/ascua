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

		// Drain before invalidating. A save debounces for 500ms, so a test
		// which mutates a record and ends without waiting leaves that write
		// pending; it then fires against a session this hook has already
		// invalidated, fails, and is reported as an error during whichever
		// test happens to be running by then. That noise is not harmless —
		// it is indistinguishable from a genuine save failure, and hid one.

		try {
			await this.store.settle();
		} catch (e) {
			// ignore — a failed write is not this hook's concern
		}

		try {
			await this.surreal.invalidate();
		} catch (e) {
			// ignore — connection may already be torn down
		}

	});
}

export default setupSurreal;

// ------------------------------------------------------------------
// Waiting helpers
// ------------------------------------------------------------------

// Poll `callback` until it returns something truthy, then return it.
//
// Deliberately a plain timer loop rather than `@ember/test-helpers`'
// `waitUntil`: a live-query notification arrives on a WebSocket callback,
// outside the Ember run loop and outside anything the test framework tracks,
// and waiting on it through the framework's own machinery made every
// live-query test hang until QUnit's global timeout rather than resolve as
// soon as the record landed.

export async function until(callback, options = {}) {
	const timeout = options.timeout === undefined ? 5000 : options.timeout;
	const interval = options.interval === undefined ? 25 : options.interval;
	const deadline = Date.now() + timeout;

	for (;;) {
		let value = callback();
		if (value) return value;
		if (Date.now() >= deadline) {
			throw new Error(options.label
				? `Timed out after ${timeout}ms waiting for: ${options.label}`
				: `Timed out after ${timeout}ms`);
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
}

// ------------------------------------------------------------------
// Autosave helpers
// ------------------------------------------------------------------

// `Model#save()` debounces for 500ms before it queues `_modify`, so a test
// that mutates a field and immediately reloads races the save it is trying to
// observe. This waits out that debounce and then drains both deferred queues,
// so on return either the write has reached the server or there was none to
// make.
//
// Prefer this to a bare `setTimeout` in tests: the timeout alone only covers
// the debounce, not the request that follows it.

export async function autosaved(record, options = {}) {
	const delay = options.delay === undefined ? 700 : options.delay;
	await new Promise((resolve) => setTimeout(resolve, delay));
	await record._modify.settle();
	await record._update.settle();
}

// ------------------------------------------------------------------
// Connection helpers
// ------------------------------------------------------------------

// Replaces `window.WebSocket` for the duration of each test with a spy that
// records every socket the SurrealDB SDK opens, and exposes
// `this.drop()` to sever the live one the way a network fault would.
//
// Must be called BEFORE `setupTest`, not merely before `setupSurreal`: an
// instance initializer looks the surreal service up while the test's owner is
// being built, so the connection is already open by the time `setupTest`'s own
// `beforeEach` returns. Patching after that captures nothing.

export function trackSockets(hooks) {

	hooks.beforeEach(function () {

		const original = window.WebSocket;
		const sockets = [];

		function Spy(...args) {
			const ws = new original(...args);
			sockets.push(ws);
			return ws;
		}

		Spy.prototype = original.prototype;
		for (const k of ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']) {
			Spy[k] = original[k];
		}

		window.WebSocket = Spy;

		this.originalWebSocket = original;
		this.sockets = sockets;

		// Sever the currently-open socket. The SDK only marks itself
		// terminated when `db.close()` is called, so a socket that closes
		// underneath it is indistinguishable from the connection dying and
		// drives the real reconnect path.
		this.drop = function () {
			const live = sockets.filter((s) => s.readyState === original.OPEN);
			const socket = live[live.length - 1];
			if (socket) socket.close();
			return socket;
		};

	});

	hooks.afterEach(function () {
		if (this.originalWebSocket) window.WebSocket = this.originalWebSocket;
	});

}
