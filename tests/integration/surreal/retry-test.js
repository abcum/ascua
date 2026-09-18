import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// A write that lands on the same record as another concurrent write - two
// of a contact's `experience` rows created together, say, each triggering a
// schema `notify` event that bumps that contact's `times.updated` - can be
// rejected by SurrealDB's optimistic concurrency control with a
// "Transaction conflict: Resource busy" error. `create()`, `update()`,
// `change()`, `modify()` and `delete()` retry that conflict instead of
// surfacing it.
//
// `beacon`/`blip` (schema.surql) reproduce a genuine conflict rather than a
// simulated one: `blip`'s CREATE event sleeps briefly before bumping a
// single shared `beacon`, which is enough for a dozen concurrent creates to
// reliably collide on it without retry.

scope('Integration | surreal | retry', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['beacon', 'blip'] });

	// ------------------------------------------------------------------
	// Policy
	// ------------------------------------------------------------------

	test('retry is enabled by default', function (assert) {
		let options = this.surreal.retry;

		assert.true(options.enabled, 'retry is enabled');
		assert.ok(options.attempts >= 3, `with headroom for more than one conflict (${options.attempts} attempts)`);
	});

	test('the first retry is fast', function (assert) {
		let options = this.surreal.retry;

		// The SDK waits `retryDelay * multiplier ** attempt`, so the first
		// retry is already multiplied once.
		let first = options.retryDelay * options.retryDelayMultiplier;

		assert.ok(first <= 500, `the first retry waits ${first}ms, quick enough that a conflict is invisible`);
	});

	// ------------------------------------------------------------------
	// Behaviour
	// ------------------------------------------------------------------

	test('concurrent creates that conflict on the same related record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'retry1', { hits: 0 });

		let count = 12;
		await Promise.all(
			Array.from({ length: count }, () => this.store.create('blip', { beacon })),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent create's notify event landed (${count} expected)`);
	});
});
