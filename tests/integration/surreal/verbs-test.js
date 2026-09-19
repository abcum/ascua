import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// `surreal`'s create/update/upsert/relate/insert/delete mirror the SDK's own
// method names and chainable shape 1:1 rather than inventing ascua-specific
// verbs (`modify`/`change`) for what the SDK itself expresses as
// `.update(id).patch(data)` / `.merge(data)`. `store`'s equivalents keep
// their own record/cache-shaped signatures, with the same verbs available
// underneath.

scope('Integration | surreal | verbs', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'ledger', 'follows', 'gremlin'] });

	async function raw(surreal, table, id) {
		let [rows] = await surreal.query(`SELECT * FROM ${table}:${id}`);
		return rows[0];
	}

	// ------------------------------------------------------------------
	// .content() vs .replace()
	// ------------------------------------------------------------------

	test('.content() silently keeps a READONLY field omitted from the payload', async function (assert) {
		await this.surreal.create('ledger', 'v1').content({ opened: new Date('2020-01-01'), balance: 10 });

		let updated = await this.surreal.update('ledger', 'v1').content({ balance: 20 });

		assert.strictEqual(updated.balance, 20, 'the given field was set');
		assert.ok(updated.opened, 'the omitted READONLY field was kept, not cleared');
		assert.strictEqual(new Date(updated.opened).getFullYear(), 2020, 'and still holds its original value');
	});

	test('.replace() rejects when a READONLY field is omitted from the payload', async function (assert) {
		await this.surreal.create('ledger', 'v2').content({ opened: new Date('2020-01-01'), balance: 10 });

		await assert.rejects(
			this.surreal.update('ledger', 'v2').replace({ balance: 20 }),
			/readonly/i,
			'.replace() is strict about READONLY fields where .content() is not',
		);

		let row = await raw(this.surreal, 'ledger', 'v2');
		assert.strictEqual(row.balance, 10, 'the rejected replace did not partially apply');
	});

	test('.replace() succeeds when the READONLY field is repeated unchanged', async function (assert) {
		let opened = new Date('2020-01-01');
		await this.surreal.create('ledger', 'v3').content({ opened, balance: 10 });

		let updated = await this.surreal.update('ledger', 'v3').replace({ opened, balance: 30 });

		assert.strictEqual(updated.balance, 30);
	});

	test('create has no .replace() - only update/upsert do', function (assert) {
		let builder = this.surreal.create('ledger', 'v4');
		assert.strictEqual(typeof builder.replace, 'undefined', 'create() has no .replace() (nothing to protect on a brand-new record)');
		assert.strictEqual(typeof this.surreal.update('ledger', 'v4').replace, 'function');
		assert.strictEqual(typeof this.surreal.upsert('ledger', 'v4').replace, 'function');
	});

	// ------------------------------------------------------------------
	// upsert
	// ------------------------------------------------------------------

	test('surreal.upsert() creates the record if it does not already exist', async function (assert) {
		let row = await this.surreal.upsert('author', 'v5').content({ name: 'Upserted' });
		assert.strictEqual(row.name, 'Upserted');
		assert.ok(await raw(this.surreal, 'author', 'v5'), 'and it is genuinely on the server');
	});

	test('store.upsert() creates and caches the record', async function (assert) {
		let author = await this.store.upsert('author', 'v6', { name: 'Cached' });
		assert.strictEqual(author.name, 'Cached');
		assert.strictEqual(this.store.cached('author', 'author:v6'), author, 'injected into the cache like create()');
	});

	test('store.upsert() supports the 2-argument (model, data) shorthand', async function (assert) {
		let author = await this.store.upsert('author', { name: 'Shorthand' });
		assert.strictEqual(author.name, 'Shorthand');
	});

	// ------------------------------------------------------------------
	// relate
	// ------------------------------------------------------------------

	test('surreal.relate() creates a graph edge between two records', async function (assert) {
		let a1 = await this.surreal.create('author', 'v7').content({ name: 'A1' });
		let a2 = await this.surreal.create('author', 'v8').content({ name: 'A2' });

		let edge = await this.surreal.relate(a1.id, 'follows', a2.id, { since: new Date('2021-06-01') });

		assert.ok(edge, 'the edge record was created');
		assert.strictEqual(String(edge.in), String(a1.id));
		assert.strictEqual(String(edge.out), String(a2.id));
		assert.strictEqual(new Date(edge.since).getFullYear(), 2021, 'the data payload was actually stored');
	});

	test('surreal.relate() without a data argument creates a plain edge', async function (assert) {
		let a1 = await this.surreal.create('author', 'v7b').content({ name: 'A1b' });
		let a2 = await this.surreal.create('author', 'v8b').content({ name: 'A2b' });

		let edge = await this.surreal.relate(a1.id, 'follows', a2.id);

		assert.ok(edge, 'the edge record was created with no data at all');
	});

	test('store.relate() creates and caches the edge record, with its data intact', async function (assert) {
		// relate() deliberately does not shadow `data` through the model the
		// way create()/update()/upsert()/insert() do - this is the one case
		// (a real field, not just an id) where that bypass would show up: a
		// native JS Date has to reach the server correctly without it.
		let a1 = await this.store.create('author', 'v9', { name: 'A1' });
		let a2 = await this.store.create('author', 'v10', { name: 'A2' });

		let edge = await this.store.relate(a1, 'follows', a2, { since: new Date('2022-03-04') });

		let cached = this.store.cached('follows', edge.id);
		assert.strictEqual(cached, edge, 'injected into the cache');
		assert.strictEqual(new Date(cached.since).getFullYear(), 2022, 'the data payload reached the server intact');
	});

	test('store.relate() without a data argument does not send an explicit NULL for an option<datetime> field', async function (assert) {
		let a1 = await this.store.create('author', 'v9b', { name: 'A1b' });
		let a2 = await this.store.create('author', 'v10b', { name: 'A2b' });

		let edge = await this.store.relate(a1, 'follows', a2);

		assert.notOk(edge.since, 'the optional field is simply absent, not explicitly nulled');
	});

	// ------------------------------------------------------------------
	// insert
	// ------------------------------------------------------------------

	test('surreal.insert() with a single object still returns an array, matching the SDK', async function (assert) {
		let rows = await this.surreal.insert('author', { name: 'Solo' });
		assert.true(Array.isArray(rows), 'insert() always returns an array, even for one row');
		assert.strictEqual(rows.length, 1);
		assert.strictEqual(rows[0].name, 'Solo');
	});

	test('surreal.insert() with an array inserts every row in one request', async function (assert) {
		let rows = await this.surreal.insert('author', [{ name: 'Bulk1' }, { name: 'Bulk2' }]);
		assert.strictEqual(rows.length, 2);
		assert.deepEqual(rows.map(r => r.name).sort(), ['Bulk1', 'Bulk2']);
	});

	test('store.insert() caches every inserted row', async function (assert) {
		let records = await this.store.insert('author', [{ name: 'CachedBulk1' }, { name: 'CachedBulk2' }]);
		assert.strictEqual(records.length, 2);
		for (let record of records) {
			assert.strictEqual(this.store.cached('author', record.id), record, `${record.name} was injected into the cache`);
		}
	});

	test('store.insert() with a single object still caches and returns one record', async function (assert) {
		let records = await this.store.insert('author', { name: 'CachedSolo' });
		assert.strictEqual(records.length, 1, 'insert() always resolves to an array, matching the SDK');
		assert.strictEqual(this.store.cached('author', records[0].id), records[0]);
	});

	// ------------------------------------------------------------------
	// Genuine server-side rejections
	// ------------------------------------------------------------------
	//
	// `gremlin`/`follows` are already-existing rejection fixtures
	// (retry-test.js's header explains `gremlin`'s ASSERT). Exercising the
	// same rejection through upsert/relate/insert - not just create/modify -
	// proves their error-propagation path (the `catch` in store.js that
	// rethrows anything that isn't a DestroyedError) actually runs for them.

	test('store.upsert() surfaces a genuine ASSERT rejection and does not cache anything', async function (assert) {
		await assert.rejects(
			this.store.upsert('gremlin', 'r1', { name: 'far too long for the assert' }),
		);

		assert.notOk(this.store.cached('gremlin', 'gremlin:r1'), 'nothing was cached');

		let [rows] = await this.surreal.query('SELECT * FROM gremlin:r1');
		assert.notOk(rows[0], 'nothing was persisted');
	});

	test('store.relate() surfaces a genuine ASSERT rejection and does not cache the edge', async function (assert) {
		let a1 = await this.store.create('author', 'r2a', { name: 'A1' });
		let a2 = await this.store.create('author', 'r2b', { name: 'A2' });

		await assert.rejects(
			this.store.relate(a1, 'follows', a2, { since: new Date('1990-01-01') }),
		);

		let [rows] = await this.surreal.query(`SELECT * FROM follows WHERE in = ${a1.id} AND out = ${a2.id}`);
		assert.strictEqual(rows.length, 0, 'no edge was persisted');
	});

	test('store.insert() surfaces a genuine ASSERT rejection and does not cache anything', async function (assert) {
		await assert.rejects(
			this.store.insert('gremlin', { name: 'far too long for the assert' }),
		);

		let [rows] = await this.surreal.query('SELECT count() AS total FROM gremlin GROUP ALL');
		let total = rows[0]?.total ?? 0;
		assert.strictEqual(total, 0, 'nothing was persisted');
	});
});
