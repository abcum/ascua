import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, until } from '@ascua/surreal/test-support';
import { DestroyedError } from '@ascua/surreal/errors';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// `batch()` sends several statements as one "BEGIN TRANSACTION; ...; COMMIT
// TRANSACTION;" request - a stand-in for `transaction()` until every
// deployed SurrealDB has the live-query fix confirmed in transaction-test.js.
// It has no callback and no branching: every statement is fully built
// before any of them run. `store`'s mutating methods (create/update/modify/
// upsert/relate/insert/delete) are therefore no longer plain async
// functions - each returns a `{compile, then, run}` object, so it can
// either be `await`ed/`.then()`ed directly (unchanged from a caller's
// perspective) or handed unconsumed to `store.batch()`.

scope('Integration | surreal | batch', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book', 'beacon', 'blip', 'stamp', 'gremlin', 'ledger'] });

	hooks.beforeEach(function () {
		this.subs = [];
		this.watch = async (table) => {
			let sub = await this.surreal.live(table);
			if (typeof sub.ready === 'function') await sub.ready();
			this.subs.push(sub);
			return sub;
		};
	});

	hooks.afterEach(async function () {
		for (const sub of this.subs) {
			try {
				await this.surreal.kill(sub);
			} catch (e) {
				// ignore — the connection may already be gone
			}
		}
	});

	async function raw(surreal, table, id) {
		let [rows] = await surreal.query(`SELECT * FROM ${table}:${id}`);
		return rows[0];
	}

	// ------------------------------------------------------------------
	// surreal.batch() - direct SDK builders
	// ------------------------------------------------------------------

	test('surreal.batch() commits every builder atomically, in one round trip', async function (assert) {
		let [a, b] = await this.surreal.batch(
			this.surreal.create('author', 'bx1').content({ name: 'One' }),
			this.surreal.create('author', 'bx2').content({ name: 'Two' }),
		);

		assert.strictEqual(a.name, 'One');
		assert.strictEqual(b.name, 'Two');
		assert.strictEqual((await raw(this.surreal, 'author', 'bx1')).name, 'One');
		assert.strictEqual((await raw(this.surreal, 'author', 'bx2')).name, 'Two');
	});

	test('surreal.batch() accepts a single array argument, same as variadic', async function (assert) {
		let [a, b] = await this.surreal.batch([
			this.surreal.create('author', 'bx3').content({ name: 'Three' }),
			this.surreal.create('author', 'bx4').content({ name: 'Four' }),
		]);

		assert.strictEqual(a.name, 'Three');
		assert.strictEqual(b.name, 'Four');
	});

	test('surreal.batch() rolls back everything if one statement is rejected', async function (assert) {
		await assert.rejects(
			this.surreal.batch(
				this.surreal.create('author', 'bx5').content({ name: 'Doomed' }),
				this.surreal.create('gremlin', 'bx6').content({ name: 'far too long for the assert' }),
			),
		);

		assert.notOk(await raw(this.surreal, 'author', 'bx5'), 'the other statement in the batch was rolled back too');
	});

	test('surreal.batch() is lazy - nothing runs until it is awaited', async function (assert) {
		let batch = this.surreal.batch(this.surreal.create('author', 'bx7').content({ name: 'Lazy' }));

		await new Promise((resolve) => setTimeout(resolve, 200));
		assert.notOk(await raw(this.surreal, 'author', 'bx7'), 'not sent yet - nothing has consumed the batch');

		await batch;
		assert.ok(await raw(this.surreal, 'author', 'bx7'), 'sent once awaited');
	});

	test('surreal.batch() retries the whole request on a genuine conflict', async function (assert) {
		let beacon = await this.store.create('beacon', 'bx8', { hits: 0 });

		let count = 8;
		await Promise.all(
			Array.from({ length: count }, () =>
				this.surreal.batch(this.surreal.create('blip').content({ beacon: beacon.id })),
			),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent batch's write landed (${count} expected)`);
	});

	test('a write made inside surreal.batch() is delivered to another session via a live query', async function (assert) {
		// The entire point of batch(): unlike beginTransaction()/commit()
		// (see transaction-test.js), this form notifies correctly today,
		// on the currently-installed SurrealDB, not just on a build with
		// the 2026-09-13 fix.
		await this.watch('author');

		await this.surreal.batch(this.surreal.create('author', 'bx9').content({ name: 'Live' }));

		await until(() => this.store.cached('author', 'author:bx9'), { timeout: 5000 });
		assert.strictEqual(this.store.cached('author', 'author:bx9').name, 'Live');
	});

	// ------------------------------------------------------------------
	// store.batch() - store-level items
	// ------------------------------------------------------------------

	test('store.batch() commits and caches every item, passed unconsumed', async function (assert) {
		let [a, b] = await this.store.batch(
			this.store.create('author', 'by1', { name: 'One' }),
			this.store.create('author', 'by2', { name: 'Two' }),
		);

		assert.strictEqual(a.name, 'One');
		assert.strictEqual(this.store.cached('author', 'author:by1'), a);
		assert.strictEqual(this.store.cached('author', 'author:by2'), b);
	});

	test('store.batch() accepts a single array argument, same as variadic', async function (assert) {
		let [a, b] = await this.store.batch([
			this.store.create('author', 'by3', { name: 'Three' }),
			this.store.create('author', 'by4', { name: 'Four' }),
		]);

		assert.strictEqual(a.name, 'Three');
		assert.strictEqual(b.name, 'Four');
	});

	test('store.batch() mixes create/update/delete in one atomic request', async function (assert) {
		let existing = await this.store.create('author', 'by5', { name: 'Before' });
		let toDelete = await this.store.create('author', 'by6', { name: 'Gone soon' });

		// store.update() sends whatever record.json currently holds, so the
		// field has to be set before building the batch, not after.
		existing.name = 'Updated';

		let [created, updated] = await this.store.batch(
			this.store.create('author', 'by7', { name: 'New' }),
			this.store.update(existing),
			this.store.delete(toDelete),
		);

		assert.strictEqual(created.name, 'New');
		assert.ok(this.store.cached('author', 'author:by7'));
		assert.notOk(this.store.cached('author', 'author:by6'), 'deleted item was unloaded from the cache');
		assert.strictEqual(updated, existing);
		assert.strictEqual(existing.name, 'Updated', 'the update was actually applied');
	});

	test('store.batch() rolls back everything, including record.rollback() for update/delete items, on a genuine rejection', async function (assert) {
		let existing = await this.store.create('author', 'by8', { name: 'Before' });
		existing.name = 'Should roll back';

		await assert.rejects(
			this.store.batch(
				this.store.update(existing),
				this.store.create('gremlin', 'by9', { name: 'far too long for the assert' }),
			),
		);

		assert.strictEqual(existing.name, 'Before', 'the update was rolled back locally');
		assert.strictEqual((await raw(this.surreal, 'author', 'by8')).name, 'Before', 'and never reached the server');
	});

	test('store.batch() retries the whole request on a genuine conflict, via create()', async function (assert) {
		let beacon = await this.store.create('beacon', 'bz1', { hits: 0 });

		let count = 8;
		await Promise.all(
			Array.from({ length: count }, () =>
				this.store.batch(this.store.create('blip', { beacon })),
			),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent batch's write landed (${count} expected)`);
	});

	test('store.batch() retries the whole request on a genuine conflict, via update()', async function (assert) {
		let beacon = await this.store.create('beacon', 'bz2', { hits: 0 });
		let stamp = await this.store.create('stamp', 'shared-batch', { beacon });

		let count = 6;
		await Promise.all(
			Array.from({ length: count }, (_, i) =>
				this.store.batch(this.store.modify(stamp, [{ op: 'replace', path: '/seq', value: i + 1 }])),
			),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent batch's update landed (${count} expected)`);
	});

	test('a write made inside store.batch() is delivered to another session via a live query', async function (assert) {
		await this.watch('author');

		await this.store.batch(this.store.create('author', 'bz3', { name: 'Live' }));

		await until(() => this.store.cached('author', 'author:bz3'), { timeout: 5000 });
		assert.strictEqual(this.store.cached('author', 'author:bz3').name, 'Live');
	});

	// ------------------------------------------------------------------
	// .then() / .run() / await equivalence
	// ------------------------------------------------------------------

	test('await behaves exactly as a direct call used to', async function (assert) {
		let author = await this.store.create('author', 'cx1', { name: 'Awaited' });
		assert.strictEqual(author.name, 'Awaited');
		assert.strictEqual(this.store.cached('author', 'author:cx1'), author);
	});

	test('.then() with no handlers still triggers execution', async function (assert) {
		this.store.create('author', 'cx2', { name: 'Bare then' }).then();

		await until(() => this.store.cached('author', 'author:cx2'), { timeout: 5000 });
		assert.strictEqual(this.store.cached('author', 'author:cx2').name, 'Bare then');
	});

	test('.run() triggers execution without the caller awaiting it', async function (assert) {
		let author = await this.store.create('author', 'cx3', { name: 'To delete' });

		this.store.delete(author).run();

		await until(() => !this.store.cached('author', 'author:cx3'), { timeout: 5000 });
		assert.notOk(await raw(this.surreal, 'author', 'cx3'), 'the fire-and-forget delete actually happened');
	});

	test('calling .then() twice on the same object does not run it twice', async function (assert) {
		let calls = 0;
		let original = this.surreal.create.bind(this.surreal);
		this.surreal.create = (...args) => {
			calls++;
			return original(...args);
		};

		try {
			let pending = this.store.create('author', 'cx4', { name: 'Once' });
			let a = await pending;
			let b = await pending;
			assert.strictEqual(a, b, 'the same, already-resolved record both times');
			assert.strictEqual(calls, 1, 'the underlying create was only ever sent once');
		} finally {
			this.surreal.create = original;
		}
	});

	test('DestroyedError is still swallowed via await, matching the old behaviour', async function (assert) {
		// A direct, deliberate simulation rather than actually destroying the
		// owner (which would tear down the test itself) - `recover()` is
		// exposed precisely so this contract can be checked without that.
		let pending = this.store.create('author', 'cx5', { name: 'Irrelevant' });
		let result = pending.recover(new DestroyedError('simulated'));
		assert.strictEqual(result, undefined, 'swallowed rather than thrown');
	});
});
