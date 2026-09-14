import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Absent, empty and partial data. A SurrealDB record only carries the fields
// it actually has, so "missing", "empty" and "cleared" are three different
// things on the wire and the connector has to keep them apart — a snapshot
// that emits an absent field as `null` writes NULL where the schema expects
// NONE, and one that treats an empty array as absent loses a deliberate
// clearing.

scope('Integration | surreal | partial and empty data', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	async function raw(surreal, id) {
		let [rows] = await surreal.query(`SELECT * FROM doodad:${id}`);
		return rows[0];
	}

	// ------------------------------------------------------------------
	// Missing fields
	// ------------------------------------------------------------------

	test('a record created with no fields at all is readable', async function (assert) {
		let doodad = await this.store.create('doodad', 'p1', {});

		assert.strictEqual(doodad.text, null, 'an unset string reads as null');
		assert.strictEqual(doodad.count, 0, 'an unset number reads as zero');
		assert.false(doodad.flag, 'an unset boolean reads as false');
		assert.strictEqual(doodad.when, null, 'an unset datetime reads as null');
		assert.strictEqual(doodad.texts.length, 0, 'an unset array reads as empty');
		assert.strictEqual(doodad.bits.text, null, 'an unset embedded object is materialised empty');
		assert.strictEqual(doodad.bitses.length, 0, 'an unset array of embedded objects reads as empty');
	});

	test('an absent field is not written back as null', async function (assert) {
		// The schema is `option<...>`, which accepts NONE but rejects an
		// explicit NULL, so a snapshot that emitted absent fields as null
		// would fail the write outright.
		await this.store.create('doodad', 'p2', { text: 'only this' });

		let row = await raw(this.surreal, 'p2');

		assert.strictEqual(row.text, 'only this', 'the field that was set is there');
		assert.notOk('when' in row && row.when !== undefined && row.when !== null, 'the datetime was not written as null');
	});

	test('reading a record does not invent values for fields it lacks', async function (assert) {
		await this.surreal.query('CREATE doodad:p3 SET text = "sparse"');

		let doodad = await this.store.select('doodad', 'doodad:p3', { reload: true });
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p3');

		assert.strictEqual(row.text, 'sparse', 'the one real field is intact');
		assert.notOk(row.link, 'no record link was invented');
		assert.notOk(row.bits && row.bits.text, 'no nested value was invented');
	});

	// ------------------------------------------------------------------
	// Empty values
	// ------------------------------------------------------------------

	test('an empty array is stored as an empty array, not dropped', async function (assert) {
		let doodad = await this.store.create('doodad', 'p4', { texts: ['a', 'b'] });

		doodad.texts.clear();
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p4');
		assert.deepEqual(row.texts, [], 'the clearing was persisted rather than ignored');
	});

	test('an emptied embedded object clears its values on the server', async function (assert) {
		let doodad = await this.store.create('doodad', 'p5', {
			bits: { text: 'gone', count: 3 },
		});

		doodad.bits = {};
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p5');
		assert.notOk(row.bits && row.bits.text, 'the nested string was cleared');
	});

	test('an empty string is distinct from an absent one', async function (assert) {
		let doodad = await this.store.create('doodad', 'p6', { text: 'something' });

		doodad.text = '';
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p6');
		assert.strictEqual(row.text, '', 'stored as an empty string');

		doodad.text = null;
		await autosaved(doodad);

		let cleared = await raw(this.surreal, 'p6');
		assert.notOk(cleared.text, 'and clearing it removes the value entirely');
	});

	// ------------------------------------------------------------------
	// Partial payloads from the server
	// ------------------------------------------------------------------

	test('injecting a partial row blanks the fields it omits, so search guards against it', async function (assert) {
		// `ingest` reads a field the payload does not carry as a field the
		// server no longer has — that is what makes a server-side clear
		// arrive locally at all — so a projection narrower than `*` is
		// indistinguishable from a record that has been emptied. This is a
		// real constraint of the design rather than something to paper over,
		// so it is asserted rather than silently tolerated.
		let doodad = await this.store.create('doodad', 'p7', {
			text: 'full',
			count: 9,
			bits: { text: 'nested' },
			texts: ['a'],
		});
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT id, text FROM doodad:p7');
		this.store.inject(rows[0]);

		assert.strictEqual(doodad.text, 'full', 'the selected field is right');
		assert.strictEqual(doodad.count, 0, 'and an omitted field was reset — a partial row is not safe to inject');

		let row = await raw(this.surreal, 'p7');
		assert.strictEqual(row.count, 9, 'though the server still holds the real value');
	});

	test('search refuses a projection that does not include *', async function (assert) {
		// `search` is async, so the assertion surfaces as a rejection rather
		// than a synchronous throw.
		await assert.rejects(
			this.store.search('doodad', { field: ['text'] }),
			/must include/,
			'a narrow projection is rejected rather than silently blanking the cache',
		);
	});

	test('search allows extra computed columns alongside *', async function (assert) {
		await this.store.create('doodad', 'p13', { text: 'scored', count: 4 });

		let results = await this.store.search('doodad', {
			field: ['*', '1 AS score'],
			where: ['text = $text'],
			param: { text: 'scored' },
		});

		assert.strictEqual(results.length, 1, 'the query ran');
		assert.strictEqual(results[0].count, 4, 'and the record kept every field');
	});

	test('a partial payload does not trigger a write that undoes the omission', async function (assert) {
		let doodad = await this.store.create('doodad', 'p8', { text: 'full', count: 9 });
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT id, text FROM doodad:p8');
		this.store.inject(rows[0]);
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p8');
		assert.strictEqual(row.count, 9, 'the server still holds the omitted field');
	});

	// ------------------------------------------------------------------
	// Clearing
	// ------------------------------------------------------------------

	test('clearing each kind of field persists', async function (assert) {
		let author = await this.store.create('author', 'pa', { name: 'A' });

		let doodad = await this.store.create('doodad', 'p9', {
			text: 'x',
			when: new Date('2026-01-01T00:00:00.000Z'),
			link: author,
			links: [author],
			texts: ['a'],
			bits: { text: 'y' },
			bitses: [{ text: 'z' }],
		});
		await autosaved(doodad);

		doodad.text = null;
		doodad.when = null;
		doodad.link = null;
		doodad.links.clear();
		doodad.texts.clear();
		doodad.bits = {};
		doodad.bitses.clear();
		await autosaved(doodad);

		let row = await raw(this.surreal, 'p9');

		assert.notOk(row.text, 'string cleared');
		assert.notOk(row.when, 'datetime cleared');
		assert.notOk(row.link, 'record link cleared');
		assert.deepEqual(row.links, [], 'array of links emptied');
		assert.deepEqual(row.texts, [], 'array of strings emptied');
		assert.notOk(row.bits && row.bits.text, 'embedded object cleared');
		assert.deepEqual(row.bitses, [], 'array of embedded objects emptied');
	});

	test('a cleared field stays cleared after a reload', async function (assert) {
		let doodad = await this.store.create('doodad', 'p10', { text: 'x', count: 5 });
		await autosaved(doodad);

		doodad.text = null;
		await autosaved(doodad);

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
		assert.strictEqual(reloaded.text, null, 'still cleared locally after a round-trip');
		assert.strictEqual(reloaded.count, 5, 'and the untouched field is intact');
	});

	// ------------------------------------------------------------------
	// Repeated saves
	// ------------------------------------------------------------------

	test('saving repeatedly with no changes writes nothing', async function (assert) {
		let doodad = await this.store.create('doodad', 'p11', { text: 'stable', count: 1 });
		await autosaved(doodad);

		let calls = [];
		for (const m of ['modify', 'change', 'update']) {
			let original = this.surreal[m].bind(this.surreal);
			this.surreal[m] = function (...args) {
				calls.push(m);
				return original(...args);
			};
		}

		await doodad.save();
		await doodad.save();
		await autosaved(doodad);

		assert.deepEqual(calls, [], 'an unchanged record is never written');
	});

	test('a record loaded from the server is not dirty', async function (assert) {
		// If a freshly-loaded record looked dirty, every list load would
		// queue a write for every row on it.
		await this.surreal.query(`
			CREATE doodad:p12 SET
				text = "loaded", count = 3, flag = true,
				texts = ["a"], counts = [1],
				bits = { text: "n", counts: [2] },
				bitses = [{ text: "e", counts: [3] }]
		`);

		let doodad = await this.store.select('doodad', 'doodad:p12', { reload: true });

		assert.false(doodad.dirty, 'nothing to save straight after loading');
	});
});
