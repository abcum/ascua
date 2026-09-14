import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, trackSockets, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// A desktop app runs for days across sleeps, VPN flaps and wifi changes, so
// the connection dying is normal operation rather than an exceptional case.
// What matters is that it comes back on its own, quickly, and that everything
// standing on top of it — authentication, live queries, writes — comes back
// with it.
//
// `trackSockets` must be installed before `setupTest`, because an instance
// initializer opens the connection as the test's owner is built.

scope('Integration | surreal | reconnection', function (hooks) {
	// `trackSockets` first: an instance initializer opens the connection while
	// `setupTest` builds the owner, so the WebSocket patch has to already be
	// in place when that happens.
	trackSockets(hooks);
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	hooks.afterEach(async function () {
		for (const sub of this.subs || []) {
			try {
				await this.surreal.kill(sub);
			} catch (e) {
				// ignore — the connection may already be gone
			}
		}
	});

	// ------------------------------------------------------------------
	// Policy
	// ------------------------------------------------------------------

	test('reconnection never gives up', async function (assert) {
		// The SDK's own default is five attempts with an exponentially
		// growing delay, which abandons the connection for good after about
		// a minute offline — a laptop lid closed over lunch comes back to an
		// app that looks fine, accepts edits, and saves none of them until it
		// is restarted.
		let options = this.surreal.reconnect;

		assert.true(options.enabled, 'reconnection is enabled');
		assert.strictEqual(options.attempts, -1, 'with no cap on the number of attempts');
	});

	test('the first reconnection attempt is fast', async function (assert) {
		let options = this.surreal.reconnect;

		// The SDK waits `retryDelay * multiplier ** attempt`, so the first
		// retry is already multiplied once.
		let first = options.retryDelay * options.retryDelayMultiplier;

		assert.ok(first <= 1000, `the first retry waits ${first}ms, which is under a second`);
		assert.ok(options.retryDelayMax <= 30000, 'and the backoff is capped well short of a minute');
	});

	// ------------------------------------------------------------------
	// Behaviour
	// ------------------------------------------------------------------

	test('a dropped connection is re-established automatically', async function (assert) {
		assert.true(this.surreal.opened, 'connected to begin with');

		this.drop();

		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop to register' });
		assert.false(this.surreal.opened, 'the drop was noticed');

		await until(() => this.surreal.opened === true, { timeout: 15000, label: 'the reconnection' });
		assert.true(this.surreal.opened, 'the connection came back on its own');
	});

	test('the session is re-authenticated after a reconnection', async function (assert) {
		assert.true(this.surreal.authenticated, 'authenticated to begin with');

		this.drop();

		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 're-authentication' });

		assert.true(this.surreal.authenticated, 'the session was restored without signing in again');
	});

	test('queries work again after a reconnection', async function (assert) {
		await this.store.create('gizmo', 'recon1', { name: 'Before' });

		this.drop();

		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		let reloaded = await this.store.select('gizmo', 'gizmo:recon1', { reload: true });
		assert.strictEqual(reloaded.name, 'Before', 'reads work again');

		reloaded.name = 'After';
		await reloaded.update();

		let [rows] = await this.surreal.query('SELECT name FROM gizmo:recon1');
		assert.strictEqual(rows[0].name, 'After', 'writes work again');
	});

	test('a write issued while disconnected still lands once reconnected', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'recon2', { name: 'Before' });

		this.drop();
		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });

		// Issued with no connection at all — the SDK queues it for the
		// restored socket rather than failing it outright.
		gizmo.name = 'Written while offline';
		await gizmo.update();

		let [rows] = await this.surreal.query('SELECT name FROM gizmo:recon2');
		assert.strictEqual(rows[0].name, 'Written while offline', 'the write landed after the reconnection');
	});

	test('live queries keep delivering after a reconnection', async function (assert) {
		this.subs = [];

		let gizmo = await this.store.create('gizmo', 'recon3', { name: 'Before' });

		let sub = await this.surreal.live('gizmo');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		// Confirm it works before the drop, so a failure afterwards is
		// unambiguously about the reconnection.
		await this.surreal.query('UPDATE gizmo:recon3 SET name = "First"');
		await until(() => gizmo.name === 'First', { timeout: 5000, label: 'the first live update' });

		this.drop();

		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		await this.surreal.query('UPDATE gizmo:recon3 SET name = "Second"');
		await until(() => gizmo.name === 'Second', {
			timeout: 15000,
			label: 'a live update after the reconnection',
		});

		assert.strictEqual(gizmo.name, 'Second', 'the live query was re-established automatically');
	});

	test('a live query survives more than one reconnection', async function (assert) {
		this.subs = [];

		let gizmo = await this.store.create('gizmo', 'recon4', { name: 'Before' });

		let sub = await this.surreal.live('gizmo');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		for (const value of ['One', 'Two']) {
			this.drop();
			await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
			await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

			await this.surreal.query(`UPDATE gizmo:recon4 SET name = "${value}"`);
			await until(() => gizmo.name === value, {
				timeout: 15000,
				label: `a live update after reconnecting for "${value}"`,
			});
		}

		assert.strictEqual(gizmo.name, 'Two', 'live updates survived repeated reconnections');
	});

	test('a killed live query is forgotten even though reconnecting changes its id', async function (assert) {
		let sub = await this.surreal.live('gizmo');
		if (typeof sub.ready === 'function') await sub.ready();

		let before = String(sub.id);

		this.drop();
		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		// A managed subscription re-registers itself under a NEW id, so
		// anything tracking it by its original id loses hold of it.
		await until(() => String(sub.id) !== before, {
			timeout: 15000,
			label: 'the subscription to be re-registered',
		});

		await this.surreal.kill(sub);

		assert.strictEqual(this.surreal.subscriptions.length, 0, 'the subscription was released');
	});
});
