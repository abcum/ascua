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
// `upsert()`, `relate()`, `insert()` and `delete()` retry that conflict
// instead of surfacing it - all six via the exact same `.retry()` call
// (`queryable()` in services/surreal.js), so a conflict reproduced through
// any one of them exercises the identical mechanism for the rest.
//
// `beacon`/`blip` (schema.surql) reproduce a genuine conflict rather than a
// simulated one: `blip`'s CREATE event sleeps briefly before bumping a
// single shared `beacon`, which is enough for a dozen concurrent creates (or,
// via `insert()`, a dozen concurrent single-row inserts) to reliably collide
// on it without retry. `stamp` is the same idea for `update()`/`upsert()`:
// its own UPDATE event does the same sleep-then-bump, so what collides is
// concurrent writes to one already-existing record rather than a fresh row
// each time.

scope('Integration | surreal | retry', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['beacon', 'blip', 'stamp'] });

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

	test('concurrent inserts that conflict on the same related record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'retry2', { hits: 0 });

		let count = 12;
		await Promise.all(
			Array.from({ length: count }, () => this.store.insert('blip', { beacon })),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent insert's notify event landed (${count} expected)`);
	});

	test('concurrent updates that conflict on the same record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'retry3', { hits: 0 });
		let stamp = await this.store.create('stamp', 'shared3', { beacon });

		// `i + 1`, not `i`: an unset `@number` field defaults to 0
		// (classes/types/number.js), so `stamp` is created with `seq` already
		// 0 - merging `{ seq: 0 }` would be a genuine no-op that SurrealDB
		// skips (and fires no UPDATE event for), silently losing exactly one
		// worker's contribution regardless of how it races.
		let count = 12;
		await Promise.all(
			Array.from({ length: count }, (_, i) => this.surreal.update('stamp', stamp.id).merge({ seq: i + 1 })),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent update's notify event landed (${count} expected)`);
	});

	test('concurrent upserts that conflict on the same record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'retry4', { hits: 0 });
		let stamp = await this.store.create('stamp', 'shared4', { beacon });

		let count = 12;
		await Promise.all(
			Array.from({ length: count }, (_, i) => this.surreal.upsert('stamp', stamp.id).merge({ seq: i + 1 })),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent upsert's notify event landed (${count} expected)`);
	});
});
