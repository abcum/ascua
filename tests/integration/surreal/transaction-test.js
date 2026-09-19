import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// `surreal.transaction()` / `store.transaction()` let several writes commit
// or fail together, instead of each being its own implicit transaction - the
// gap that let LinkedIn imports collide on a shared contact record (HI-371).
//
// `beacon`/`blip` (schema.surql) reproduce a genuine "Transaction conflict"
// the same way `retry-test.js` does: `blip`'s CREATE event sleeps briefly
// before bumping a shared `beacon`, which is enough for two concurrent
// transactions to collide on it.

scope('Integration | surreal | transaction', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book', 'beacon', 'blip', 'stamp', 'gizmo', 'follows'] });

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
	// Commit
	// ------------------------------------------------------------------

	test('every write made inside a transaction is visible once it commits', async function (assert) {
		await this.store.transaction(async (tx) => {
			await tx.create('author', 'tx1a', { name: 'One' });
			await tx.create('author', 'tx1b', { name: 'Two' });
		});

		assert.strictEqual((await raw(this.surreal, 'author', 'tx1a')).name, 'One');
		assert.strictEqual((await raw(this.surreal, 'author', 'tx1b')).name, 'Two');
	});

	test('records created inside a transaction reach the store cache only once it commits', async function (assert) {
		let seenDuring;

		await this.store.transaction(async (tx) => {
			let created = await tx.create('author', 'tx2', { name: 'Ada' });
			seenDuring = this.store.cached('author', created.id);
		});

		assert.notOk(seenDuring, 'not cached while the transaction was still open');
		assert.ok(this.store.cached('author', 'author:tx2'), 'cached once it committed');
	});

	// ------------------------------------------------------------------
	// Rollback
	// ------------------------------------------------------------------

	test('a thrown error inside the callback rolls back every write made so far', async function (assert) {
		await assert.rejects(
			this.store.transaction(async (tx) => {
				await tx.create('author', 'tx3', { name: 'Doomed' });
				throw new Error('nope');
			}),
			/nope/,
		);

		assert.notOk(await raw(this.surreal, 'author', 'tx3'), 'nothing was persisted');
		assert.notOk(this.store.cached('author', 'author:tx3'), 'and nothing reached the cache');
	});

	test('a delete made inside a transaction that then fails leaves the record intact', async function (assert) {
		let author = await this.store.create('author', 'tx4', { name: 'Keep' });

		await assert.rejects(
			this.store.transaction(async (tx) => {
				await tx.delete(author);
				throw new Error('nope');
			}),
		);

		assert.strictEqual((await raw(this.surreal, 'author', 'tx4')).name, 'Keep', 'still on the server');
		assert.ok(this.store.cached('author', author.id), 'still in the cache');
	});

	test('a delete made inside a transaction that commits removes the record', async function (assert) {
		let author = await this.store.create('author', 'tx5', { name: 'Gone' });

		await this.store.transaction(async (tx) => {
			await tx.delete(author);
		});

		assert.notOk(await raw(this.surreal, 'author', 'tx5'), 'removed from the server');
		assert.notOk(this.store.cached('author', 'author:tx5'), 'and from the cache');
	});

	// ------------------------------------------------------------------
	// Read-your-own-writes
	// ------------------------------------------------------------------

	test('a search inside a transaction sees that transaction\'s own uncommitted write', async function (assert) {
		await this.store.transaction(async (tx) => {
			await tx.create('author', 'tx6', { name: 'Findme' });

			let found = await tx.search('author', {
				where: ['name = $name'],
				param: { name: 'Findme' },
				limit: 1,
			});

			assert.ok(found, 'the search found the row created earlier in the same transaction');
			assert.notOk(this.store.cached('author', 'author:tx6'), 'but it is not yet in the live cache');
		});
	});

	test('a read of an uncommitted write does not leak into the cache if the transaction is cancelled', async function (assert) {
		await assert.rejects(
			this.store.transaction(async (tx) => {
				await tx.create('author', 'tx7', { name: 'Ghost' });

				await tx.search('author', {
					where: ['name = $name'],
					param: { name: 'Ghost' },
					limit: 1,
				});

				throw new Error('nope');
			}),
		);

		assert.notOk(await raw(this.surreal, 'author', 'tx7'), 'nothing was persisted');
		assert.notOk(this.store.cached('author', 'author:tx7'), 'and the read never reached the cache');
	});

	test('tx.select() also sees a transaction\'s own uncommitted write, buffered the same as tx.search()', async function (assert) {
		let seenDuring;

		await this.store.transaction(async (tx) => {
			let created = await tx.create('author', 'tx7b', { name: 'Selectable' });
			let selected = await tx.select('author', created.id);

			assert.ok(selected, 'select() found the row created earlier in the same transaction');
			seenDuring = this.store.cached('author', 'author:tx7b');
		});

		assert.notOk(seenDuring, 'not cached while the transaction was still open');
		assert.ok(this.store.cached('author', 'author:tx7b'), 'cached once it committed');
	});

	// ------------------------------------------------------------------
	// Gotcha: a raw row, passed into a record-link field, self-injects
	// ------------------------------------------------------------------
	//
	// `classes/field/record.js`'s setter injects a plain object it is
	// handed straight into the live cache to resolve the link - which
	// defeats the whole point of buffering here if that object is a row
	// created or found earlier in the SAME still-open transaction. Passing
	// its `.id` (a RecordId) instead is handled without touching the cache.

	test('pointing a record-link field at a raw row from earlier in the transaction leaks it into the cache', async function (assert) {
		await this.store.transaction(async (tx) => {
			let author = await tx.create('author', 'tx10a', { name: 'Leaky' });
			// The mistake: passing the raw row itself, not `author.id`.
			await tx.create('book', 'tx10b', { title: 'Oops', author });
		});

		assert.ok(
			this.store.cached('author', 'author:tx10a'),
			'the raw row leaked into the cache even though the transaction was still open when it happened',
		);
	});

	test('pointing a record-link field at the .id of a raw row from earlier in the transaction does not leak', async function (assert) {
		let seenDuring;

		await this.store.transaction(async (tx) => {
			let author = await tx.create('author', 'tx11a', { name: 'Safe' });
			await tx.create('book', 'tx11b', { title: 'Fine', author: author.id });
			seenDuring = this.store.cached('author', 'author:tx11a');
		});

		assert.notOk(seenDuring, 'not cached while the transaction was still open');
		assert.ok(this.store.cached('author', 'author:tx11a'), 'cached once it committed, same as any other write');
	});

	test('the same leak happens via tx.update(), not just tx.create()', async function (assert) {
		// tx.update()/tx.upsert() build their payload through the exact same
		// `payload()` helper as tx.create() - the leak is a property of that
		// shared shadow-model construction, not something special to create().
		let existing = await this.store.create('book', 'tx13b', { title: 'Placeholder' });

		await this.store.transaction(async (tx) => {
			let author = await tx.create('author', 'tx13a', { name: 'AlsoLeaky' });
			await tx.update('book', existing.id, { title: 'Updated', author });
		});

		assert.ok(
			this.store.cached('author', 'author:tx13a'),
			'the raw row leaked via tx.update() too, since it shares payload() with tx.create()',
		);
	});

	test('the same leak happens via tx.upsert(), not just tx.create()', async function (assert) {
		await this.store.transaction(async (tx) => {
			let author = await tx.create('author', 'tx14a', { name: 'AlsoLeaky2' });
			await tx.upsert('book', 'tx14b', { title: 'Oops', author });
		});

		assert.ok(
			this.store.cached('author', 'author:tx14a'),
			'the raw row leaked via tx.upsert() too',
		);
	});

	test('tx.upsert() supports the 2-argument (model, data) shorthand', async function (assert) {
		await this.store.transaction(async (tx) => {
			await tx.upsert('author', { name: 'TxShorthand' });
		});

		let [rows] = await this.surreal.query('SELECT * FROM author WHERE name = "TxShorthand"');
		assert.strictEqual(rows.length, 1, 'created without an explicit id, same as the top-level store.upsert() shorthand');
	});

	// ------------------------------------------------------------------
	// update / upsert / relate / insert
	// ------------------------------------------------------------------
	//
	// Same verb surface as the base `store`/`surreal` services, available
	// inside a transaction too - built from the same `queryable()` factory
	// at the `surreal` level (see services/surreal.js), and the same
	// buffer-until-commit treatment as `create` at the `store` level.

	test('store.transaction() supports update/upsert/relate/insert, buffered until commit', async function (assert) {
		let author = await this.store.create('author', 'txv1', { name: 'Before' });

		let result = await this.store.transaction(async (tx) => {

			let updated = await tx.update('author', author.id, { name: 'Updated' });
			let upserted = await tx.upsert('author', 'txv2', { name: 'Upserted' });
			let other = await tx.create('author', 'txv3', { name: 'Other' });
			let edge = await tx.relate(upserted.id, 'follows', other.id, { since: new Date('2022-01-01') });
			let [bulk1, bulk2] = await tx.insert('author', [{ name: 'Bulk1' }, { name: 'Bulk2' }]);

			// Nothing touched by this transaction has reached the cache yet.
			// `author` predates the transaction, so it was already cached -
			// what matters is that its update hasn't been ingested into it yet.
			assert.strictEqual(this.store.cached('author', author.id).name, 'Before', 'update() not ingested mid-transaction');
			assert.notOk(this.store.cached('author', 'author:txv2'), 'upsert() not cached mid-transaction');
			assert.notOk(this.store.cached('follows', edge.id), 'relate() not cached mid-transaction');
			assert.notOk(this.store.cached('author', bulk1.id), 'insert() not cached mid-transaction');

			return { updated, upserted, other, edge, bulk1, bulk2 };

		});

		assert.strictEqual(this.store.cached('author', author.id).name, 'Updated', 'update() committed and cached');
		assert.strictEqual(this.store.cached('author', 'author:txv2').name, 'Upserted', 'upsert() committed and cached');
		assert.strictEqual(
			new Date(this.store.cached('follows', result.edge.id).since).getFullYear(),
			2022,
			'relate() committed with its data intact, not just its link',
		);
		assert.ok(this.store.cached('author', result.bulk1.id), 'insert() committed and cached');
		assert.ok(this.store.cached('author', result.bulk2.id), 'insert() committed and cached (second row)');
	});

	test('store.transaction() discards update/upsert/relate/insert if it is cancelled', async function (assert) {
		let author = await this.store.create('author', 'txv4', { name: 'Before' });

		await assert.rejects(
			this.store.transaction(async (tx) => {
				await tx.update('author', author.id, { name: 'Should not stick' });
				await tx.upsert('author', 'txv5', { name: 'Should not exist' });
				let other = await tx.create('author', 'txv6', { name: 'Other' });
				await tx.relate(author.id, 'follows', other.id);
				await tx.insert('author', { name: 'Should not exist either' });
				throw new Error('nope');
			}),
		);

		assert.strictEqual(author.name, 'Before', 'the pre-existing record was not changed');
		assert.notOk(this.store.cached('author', 'author:txv5'), 'the upsert did not leak in');

		let [rows] = await this.surreal.query('SELECT * FROM author WHERE name IN ["Should not exist", "Should not exist either"]');
		assert.strictEqual(rows.length, 0, 'nothing was actually persisted');
	});

	test('surreal.transaction() exposes the same update/upsert/relate/insert chainable surface', async function (assert) {
		let a1 = await this.surreal.create('author', 'txv7').content({ name: 'A1' });
		let a2 = await this.surreal.create('author', 'txv8').content({ name: 'A2' });

		await this.surreal.transaction(async (tx) => {
			await tx.update('author', a1.id).merge({ tags: ['updated'] });
			await tx.upsert('author', 'txv9').content({ name: 'Upserted' });
			await tx.relate(a1.id, 'follows', a2.id, { since: new Date('2022-02-02') });
			await tx.insert('author', { name: 'Inserted' });
		});

		let [[updated]] = await this.surreal.query('SELECT * FROM author:txv7');
		assert.deepEqual(updated.tags, ['updated']);

		let [[upserted]] = await this.surreal.query('SELECT * FROM author:txv9');
		assert.strictEqual(upserted.name, 'Upserted');

		let [edges] = await this.surreal.query(`SELECT * FROM follows WHERE in = author:txv7 AND out = author:txv8`);
		assert.strictEqual(edges.length, 1);
		assert.strictEqual(new Date(edges[0].since).getFullYear(), 2022, 'the edge data was actually stored');

		let [inserted] = await this.surreal.query(`SELECT * FROM author WHERE name = "Inserted"`);
		assert.strictEqual(inserted.length, 1);
	});

	// ------------------------------------------------------------------
	// Conflict retry
	// ------------------------------------------------------------------

	test('concurrent transactions that conflict on the same related record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'tx8', { hits: 0 });

		// Retrying a whole transaction is a full begin+create+commit round
		// trip per attempt, not the single cheap statement `.retry()` retries
		// - so it covers less wall-clock per attempt than the per-statement
		// retry `retry-test.js` exercises with 12 concurrent creates. Verified
		// directly: 8 concurrent conflicting transactions against the default
		// 5-attempt policy occasionally exhausts it under this much
		// contention; 5 does not, in repeated runs.
		let count = 5;
		await Promise.all(
			Array.from({ length: count }, () =>
				this.store.transaction(async (tx) => {
					await tx.create('blip', { beacon });
				}),
			),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent transaction's write landed (${count} expected)`);
	});

	test('concurrent transactions updating the same record all succeed', async function (assert) {
		let beacon = await this.store.create('beacon', 'tx12', { hits: 0 });
		let stamp = await this.store.create('stamp', 'shared-tx', { beacon });

		// Same contention shape as the create-based test above, via tx.update()
		// instead of tx.create() - proving the whole-transaction retry loop
		// (built once in `surreal.transaction()`, not per-verb) covers this
		// verb too, not just create().
		let count = 5;
		await Promise.all(
			Array.from({ length: count }, (_, i) =>
				this.store.transaction(async (tx) => {
					// tx.update() is a full content replace (like store.create()),
					// so `beacon` has to be repeated here or it would be cleared.
					await tx.update('stamp', stamp.id, { beacon, seq: i + 1 });
				}),
			),
		);

		let reloaded = await this.store.select('beacon', beacon.id, { reload: true });
		assert.strictEqual(reloaded.hits, count, `every concurrent transaction's update landed (${count} expected)`);
	});

	// ------------------------------------------------------------------
	// Live queries
	// ------------------------------------------------------------------
	//
	// A write made through `beginTransaction()`/`commit()` used to never
	// trigger a live-query notification at all - not delayed until commit,
	// simply never sent, even though the write itself genuinely committed
	// (confirmed directly against a real server: a plain write, and the
	// equivalent single-request `BEGIN`/`COMMIT` text form, both notified
	// correctly; this session-scoped transaction API did not). Reported
	// upstream and fixed in SurrealDB on 2026-09-13 - this test needs a
	// build containing that fix (verified against a local nightly; not yet
	// in the 3.2.3 stable release at time of writing), and will fail
	// against an older `surreal` binary with the original message inverted
	// (the notification not arriving at all).
	//
	// `store.transaction()` still injects committed rows into the cache
	// itself rather than relying on this - not only because of the bug
	// above, but because a transaction's own reads can see its own
	// uncommitted writes (see the read-your-own-writes tests above), which
	// a live query watching from outside never will.

	test('a write made inside a transaction is delivered to another session once it commits', async function (assert) {
		await this.watch('gizmo');

		await this.surreal.transaction(async (tx) => {
			await tx.create('gizmo', 'tx9').content({ name: 'Live' });
		});

		await until(() => this.store.cached('gizmo', 'gizmo:tx9'), { timeout: 5000 });
		assert.strictEqual(this.store.cached('gizmo', 'gizmo:tx9')?.name, 'Live', 'the notification arrived once the transaction committed');
	});
});
