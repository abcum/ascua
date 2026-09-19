import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Saves are debounced and queued, so edits, in-flight writes, incoming server
// state and deletes all overlap in practice. These cover what happens when
// they do — the failure mode is never a crash, it is an edit that quietly
// never reaches the server.

scope('Integration | surreal | concurrency and failures', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad', 'gremlin'] });

	async function raw(surreal, table, id) {
		let [rows] = await surreal.query(`SELECT * FROM ${table}:${id}`);
		return rows[0];
	}

	// ------------------------------------------------------------------
	// Debouncing and coalescing
	// ------------------------------------------------------------------

	test('rapid edits coalesce into a single write', async function (assert) {
		let doodad = await this.store.create('doodad', 'c1', { text: 'start' });
		await autosaved(doodad);

		let writes = 0;
		let original = this.surreal.update.bind(this.surreal);
		this.surreal.update = function (...args) {
			writes++;
			return original(...args);
		};

		doodad.text = 'a';
		doodad.text = 'ab';
		doodad.text = 'abc';
		doodad.text = 'abcd';
		await autosaved(doodad);

		assert.strictEqual(writes, 1, 'four edits produced one request');
		assert.strictEqual((await raw(this.surreal, 'doodad', 'c1')).text, 'abcd', 'the last value won');
	});

	test('edits to several fields coalesce into one write carrying all of them', async function (assert) {
		let doodad = await this.store.create('doodad', 'c2', { text: 'a', count: 1 });
		await autosaved(doodad);

		doodad.text = 'b';
		doodad.count = 2;
		doodad.flag = true;
		doodad.texts.pushObject('x');
		await autosaved(doodad);

		let row = await raw(this.surreal, 'doodad', 'c2');
		assert.strictEqual(row.text, 'b', 'string saved');
		assert.strictEqual(row.count, 2, 'number saved');
		assert.true(row.flag, 'boolean saved');
		assert.deepEqual(row.texts, ['x'], 'array saved');
	});

	test('an edit made while a save is in flight is not lost', async function (assert) {
		let doodad = await this.store.create('doodad', 'c3', { text: 'first', count: 0 });
		await autosaved(doodad);

		// Start a save, then edit a different field before it settles.
		doodad.text = 'second';
		let inflight = doodad.save();
		await wait(520);
		doodad.count = 7;

		await inflight;
		await autosaved(doodad);

		let row = await raw(this.surreal, 'doodad', 'c3');
		assert.strictEqual(row.text, 'second', 'the in-flight change landed');
		assert.strictEqual(row.count, 7, 'and so did the one made while it was in flight');
	});

	test('edits made during a reload are preserved and still saved', async function (assert) {
		let doodad = await this.store.create('doodad', 'c4', { text: 'server', count: 1 });
		await autosaved(doodad);

		// Kick off a reload and mutate while it is in flight, so `ingest`
		// has to merge the local change on top of the incoming state.
		let reloading = this.store.select('doodad', doodad.id, { reload: true });
		doodad.count = 99;
		await reloading;

		assert.strictEqual(doodad.count, 99, 'the local edit survived the ingest');

		await autosaved(doodad);
		assert.strictEqual((await raw(this.surreal, 'doodad', 'c4')).count, 99, 'and reached the server');
	});

	test('interleaved saves on different records do not cross over', async function (assert) {
		let one = await this.store.create('doodad', 'c5a', { text: 'one' });
		let two = await this.store.create('doodad', 'c5b', { text: 'two' });
		await autosaved(one);
		await autosaved(two);

		one.text = 'ONE';
		two.text = 'TWO';
		await Promise.all([autosaved(one), autosaved(two)]);

		assert.strictEqual((await raw(this.surreal, 'doodad', 'c5a')).text, 'ONE');
		assert.strictEqual((await raw(this.surreal, 'doodad', 'c5b')).text, 'TWO');
	});

	// ------------------------------------------------------------------
	// Deletes racing writes
	// ------------------------------------------------------------------

	test('a delete issued during a pending save removes the record', async function (assert) {
		let doodad = await this.store.create('doodad', 'c6', { text: 'doomed' });
		await autosaved(doodad);

		doodad.text = 'changed';
		await doodad.delete();

		let [rows] = await this.surreal.query('SELECT * FROM doodad:c6');
		assert.strictEqual(rows.length, 0, 'the record is gone');
		assert.false(doodad.exists, 'and is marked deleted locally');
	});

	test('an edit after a successful delete does not recreate the record', async function (assert) {
		let doodad = await this.store.create('doodad', 'c7', { text: 'doomed' });
		await autosaved(doodad);
		await doodad.delete();

		// Something still holding a reference mutates it.
		doodad.text = 'zombie';
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT * FROM doodad:c7');
		assert.strictEqual(rows.length, 0, 'the record stayed deleted');
	});

	// ------------------------------------------------------------------
	// Writes the server rejects
	// ------------------------------------------------------------------

	test('a rejected save records the error and rolls the value back', async function (assert) {
		let gremlin = await this.store.create('gremlin', 'g1', { name: 'ok' });
		await autosaved(gremlin);

		gremlin.name = 'far too long for the assert';
		await autosaved(gremlin);

		assert.ok(gremlin.error, 'the failure was recorded on the record');
		assert.strictEqual(gremlin.name, 'ok', 'the value was rolled back to the last saved one');
		assert.strictEqual((await raw(this.surreal, 'gremlin', 'g1')).name, 'ok', 'and the server is unchanged');
	});

	test('a record still saves after a rejected save', async function (assert) {
		// A failed save must not leave the record stuck: `@autosave` only
		// fires while the record is LOADED, so a rollback that failed to
		// restore that state would silently disable saving from then on.
		let gremlin = await this.store.create('gremlin', 'g2', { name: 'ok' });
		await autosaved(gremlin);

		gremlin.name = 'far too long for the assert';
		await autosaved(gremlin);

		gremlin.name = 'fine';
		await autosaved(gremlin);

		assert.notOk(gremlin.error, 'the recorded error was cleared by the successful save');
		assert.strictEqual((await raw(this.surreal, 'gremlin', 'g2')).name, 'fine', 'the later edit was saved');
	});

	test('a rejected save does not discard an unrelated field', async function (assert) {
		let gremlin = await this.store.create('gremlin', 'g3', { name: 'ok', note: 'keep' });
		await autosaved(gremlin);

		gremlin.name = 'far too long for the assert';
		await autosaved(gremlin);

		assert.strictEqual((await raw(this.surreal, 'gremlin', 'g3')).note, 'keep', 'the other field is intact');
	});

	test('an explicit save() rejects so the caller can see the failure', async function (assert) {
		let gremlin = await this.store.create('gremlin', 'g4', { name: 'ok' });
		await autosaved(gremlin);

		gremlin.name = 'far too long for the assert';

		await assert.rejects(gremlin.save(), 'save() surfaces the failure rather than swallowing it');
	});

	test('an explicit update() rejects and rolls back', async function (assert) {
		let gremlin = await this.store.create('gremlin', 'g5', { name: 'ok' });
		await autosaved(gremlin);

		gremlin.name = 'far too long for the assert';

		await assert.rejects(gremlin.update(), 'update() surfaces the failure');
		assert.strictEqual(gremlin.name, 'ok', 'and the value was rolled back');
	});

	// ------------------------------------------------------------------
	// Store identity
	// ------------------------------------------------------------------

	test('the same record is one object however it was fetched', async function (assert) {
		let created = await this.store.create('doodad', 'c8', { text: 'identity' });

		let selected = await this.store.select('doodad', created.id, { reload: true });
		let searched = await this.store.search('doodad', {
			where: ['text = $text'],
			param: { text: 'identity' },
		});

		assert.strictEqual(selected, created, 'select returned the cached instance');
		assert.strictEqual(searched[0], created, 'and so did search');
	});

	test('unloading a record removes it from the cache without touching the server', async function (assert) {
		let doodad = await this.store.create('doodad', 'c9', { text: 'cached' });

		this.store.unload('doodad', doodad.id);

		assert.notOk(this.store.cached('doodad', doodad.id), 'gone from the cache');
		assert.strictEqual((await raw(this.surreal, 'doodad', 'c9')).text, 'cached', 'still on the server');
	});
});
