import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Record ids and the identity cache. Since 3.x an id is a native RecordId and
// two instances for the same record are never `===`, so everything that keys
// off an id has to compare by value — a cache that misses lets a second copy
// of the same record exist, and the two then diverge as each is edited.

scope('Integration | surreal | record identity', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	// ------------------------------------------------------------------
	// Id shapes
	// ------------------------------------------------------------------

	test('a generated id round-trips and caches', async function (assert) {
		let created = await this.store.create('doodad', null, { text: 'generated' });

		assert.ok(created.id instanceof RecordId, 'a native RecordId');
		assert.strictEqual(this.store.cached('doodad', created.id), created, 'found in the cache by its own id');
		assert.strictEqual(
			this.store.cached('doodad', String(created.id)),
			created,
			'and by the string form of that id',
		);
	});

	test('a numeric id round-trips and caches', async function (assert) {
		await this.surreal.query('CREATE doodad:42 SET text = "numeric"');

		let doodad = await this.store.select('doodad', new RecordId('doodad', 42), { reload: true });

		assert.strictEqual(doodad.text, 'numeric', 'loaded');
		assert.strictEqual(this.store.cached('doodad', doodad.id), doodad, 'cached under its own id');
	});

	test('an id needing escaping round-trips by every safe form', async function (assert) {
		// An id which is not a bare ident has to be escaped to be named in
		// SurrealQL, and `String(recordId)` already does that — it yields
		// `doodad:⟨with-a-dash⟩`, not `doodad:with-a-dash`.
		await this.surreal.query('CREATE doodad:⟨with-a-dash⟩ SET text = "dashed"');

		let byRecordId = await this.store.select('doodad', new RecordId('doodad', 'with-a-dash'), { reload: true });
		assert.strictEqual(byRecordId.text, 'dashed', 'a native RecordId works');

		let byBareId = await this.store.select('doodad', 'with-a-dash', { reload: true });
		assert.strictEqual(byBareId, byRecordId, 'a bare id works, and resolves to the same record');

		let byStringified = await this.store.select('doodad', String(byRecordId.id), { reload: true });
		assert.strictEqual(byStringified, byRecordId, 'and so does the stringified id');

		assert.strictEqual(byRecordId.tb, 'doodad', 'the table was derived correctly');
	});

	test('a hand-built unescaped id string does not resolve', async function (assert) {
		// Worth pinning down rather than leaving to be rediscovered: a full
		// `"tb:id"` string is parsed as SurrealQL, so building one by
		// concatenation silently fails for any id that needs escaping. Use
		// `String(record.id)`, or pass the bare id and let the table be
		// supplied.
		await this.surreal.query('CREATE doodad:⟨needs-escaping⟩ SET text = "escaped"');

		let result = await this.store.select('doodad', 'doodad:needs-escaping', { reload: true });

		assert.notOk(result, 'the unescaped form found nothing');
	});

	test('an id containing a colon round-trips', async function (assert) {
		// `tb:id` is parsed by splitting on the first colon, so an id that
		// itself contains one must not lose its tail.
		await this.surreal.query('CREATE doodad:⟨a:b⟩ SET text = "coloned"');

		let [rows] = await this.surreal.query('SELECT * FROM doodad WHERE text = "coloned"');
		let doodad = this.store.inject(rows[0]);

		assert.strictEqual(doodad.tb, 'doodad', 'the table is still the table');
		assert.strictEqual(doodad.meta.id, 'a:b', 'and the whole id survived');
	});

	test('a uuid-shaped id round-trips', async function (assert) {
		let id = '0198c0de-1234-7abc-8def-0123456789ab';
		await this.surreal.query(`CREATE doodad:⟨${id}⟩ SET text = "uuid"`);

		let doodad = await this.store.select('doodad', new RecordId('doodad', id), { reload: true });

		assert.strictEqual(doodad.text, 'uuid', 'loaded');
		assert.strictEqual(doodad.meta.id, id, 'the id survived intact');
		assert.strictEqual(String(doodad.id), `doodad:⟨${id}⟩`, 'and stringifies to its escaped form');
	});

	// ------------------------------------------------------------------
	// Cache identity
	// ------------------------------------------------------------------

	test('two RecordId instances for the same record find the same object', async function (assert) {
		let created = await this.store.create('doodad', 'i1', { text: 'one copy' });

		let other = new RecordId('doodad', 'i1');
		assert.notStrictEqual(other, created.id, 'a distinct RecordId instance');
		assert.strictEqual(this.store.cached('doodad', other), created, 'still resolves to the one cached record');
	});

	test('repeated loads never produce a second copy of a record', async function (assert) {
		let created = await this.store.create('doodad', 'i2', { text: 'single' });

		await this.store.select('doodad', created.id, { reload: true });
		await this.store.select('doodad', String(created.id), { reload: true });
		await this.store.search('doodad', { where: ['text = $t'], param: { t: 'single' } });

		let all = [...this.store.cached('doodad')].filter((r) => String(r.id) === 'doodad:i2');
		assert.strictEqual(all.length, 1, 'exactly one instance in the cache');
	});

	test('an edit is visible through every reference to the record', async function (assert) {
		let created = await this.store.create('doodad', 'i3', { text: 'before' });
		let found = await this.store.select('doodad', created.id, { reload: true });

		created.text = 'after';

		assert.strictEqual(found.text, 'after', 'the other reference sees it, because it is the same object');
	});

	test('selecting several ids at once returns the cached records', async function (assert) {
		let one = await this.store.create('doodad', 'i4a', { text: 'one' });
		let two = await this.store.create('doodad', 'i4b', { text: 'two' });

		let found = this.store.cached('doodad', [one.id, two.id]);

		assert.strictEqual(found.length, 2, 'both found');
		assert.deepEqual(found.map((r) => r.text).sort(), ['one', 'two'], 'and they are the right ones');
	});

	test('a cache miss returns undefined rather than throwing', async function (assert) {
		assert.strictEqual(this.store.cached('doodad', 'doodad:nope'), undefined, 'a miss is undefined');
		assert.deepEqual(this.store.cached('doodad', ['doodad:nope']), [], 'an array miss is empty');
	});

	test('unloading one record leaves the others alone', async function (assert) {
		let one = await this.store.create('doodad', 'i5a', { text: 'keep' });
		let two = await this.store.create('doodad', 'i5b', { text: 'drop' });

		this.store.unload('doodad', two.id);

		assert.strictEqual(this.store.cached('doodad', one.id), one, 'the other is still cached');
		assert.notOk(this.store.cached('doodad', two.id), 'the unloaded one is gone');
	});

	test('resetting the store empties every table', async function (assert) {
		await this.store.create('doodad', 'i6', { text: 'x' });
		await this.store.create('author', 'i7', { name: 'y' });

		this.store.reset();

		assert.strictEqual(this.store.cached('doodad').length, 0, 'doodads cleared');
		assert.strictEqual(this.store.cached('author').length, 0, 'authors cleared');
	});

	// ------------------------------------------------------------------
	// Concurrent loads
	// ------------------------------------------------------------------

	test('concurrent selects of the same record share one request', async function (assert) {
		await this.store.create('doodad', 'i8', { text: 'shared' });
		this.store.unload('doodad', 'doodad:i8');

		let fetches = 0;
		let original = this.surreal.select.bind(this.surreal);
		this.surreal.select = function (...args) {
			fetches++;
			return original(...args);
		};

		let [a, b, c] = await Promise.all([
			this.store.select('doodad', 'doodad:i8'),
			this.store.select('doodad', 'doodad:i8'),
			this.store.select('doodad', 'doodad:i8'),
		]);

		assert.strictEqual(fetches, 1, 'three concurrent selects made one request');
		assert.strictEqual(a, b, 'and all resolved to the same record');
		assert.strictEqual(b, c, 'all three');
	});

	test('a record deleted elsewhere leaves the cache when reloaded', async function (assert) {
		let doodad = await this.store.create('doodad', 'i9', { text: 'doomed' });
		await autosaved(doodad);

		await this.surreal.query('DELETE doodad:i9');

		let result = await this.store.select('doodad', 'doodad:i9', { reload: true });

		assert.notOk(result, 'the reload yielded nothing rather than throwing');
	});
});
