import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// `Model#ingest` replays the changes made while a write was in flight on top
// of the state the server sent back, using `Patch`. These exercise that
// replay against a real server: every edit made during the round trip has to
// survive it, and every edit made before it has to still be there afterwards.

scope('Integration | surreal | in-flight edits', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	async function raw(surreal, id) {
		let [rows] = await surreal.query(`SELECT * FROM doodad:${id}`);
		return rows[0];
	}

	// Mutate while a save is genuinely mid-flight: past the debounce, before
	// the response has landed.
	async function during(record, mutate) {
		let inflight = record.save();
		await wait(520);
		mutate();
		await inflight;
		await autosaved(record);
	}

	test('a trailing element removed during a save stays removed', async function (assert) {
		// Removing from the end is the only shape that produces `remove` ops
		// at all — `Diff.arr()` replaces the whole array for anything else —
		// so it is the only one whose replay goes through the array-removal
		// path in `Patch`.
		let doodad = await this.store.create('doodad', 'f1', { texts: ['a', 'b', 'c'], text: 'x' });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => doodad.texts.popObject());

		assert.deepEqual([...doodad.texts], ['a', 'b'], 'the element is gone locally');
		assert.deepEqual((await raw(this.surreal, 'f1')).texts, ['a', 'b'], 'and gone on the server');
	});

	test('several trailing elements removed during a save stay removed', async function (assert) {
		let doodad = await this.store.create('doodad', 'f2', { texts: ['a', 'b', 'c', 'd'], text: 'x' });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => {
			doodad.texts.popObject();
			doodad.texts.popObject();
		});

		assert.deepEqual([...doodad.texts], ['a', 'b'], 'both are gone locally');
		assert.deepEqual((await raw(this.surreal, 'f2')).texts, ['a', 'b'], 'and on the server');
	});

	test('an element removed from the middle during a save stays removed', async function (assert) {
		let doodad = await this.store.create('doodad', 'f2b', { texts: ['a', 'b', 'c'], text: 'x' });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => doodad.texts.removeObject('b'));

		assert.deepEqual([...doodad.texts], ['a', 'c'], 'the element is gone locally');
		assert.deepEqual((await raw(this.surreal, 'f2b')).texts, ['a', 'c'], 'and gone on the server');
	});

	test('an element added during a save is kept', async function (assert) {
		let doodad = await this.store.create('doodad', 'f3', { texts: ['a'], text: 'x' });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => doodad.texts.pushObject('b'));

		assert.deepEqual((await raw(this.surreal, 'f3')).texts, ['a', 'b'], 'the addition survived the round trip');
	});

	test('an embedded object edited during a save keeps the edit', async function (assert) {
		let doodad = await this.store.create('doodad', 'f4', {
			text: 'x',
			bits: { text: 'before', count: 1 },
		});
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => { doodad.bits.text = 'during'; });

		let row = await raw(this.surreal, 'f4');
		assert.strictEqual(row.bits.text, 'during', 'the nested edit survived');
		assert.strictEqual(row.text, 'y', 'and so did the one that started the save');
	});

	test('an array element edited during a save keeps the edit', async function (assert) {
		let doodad = await this.store.create('doodad', 'f5', {
			text: 'x',
			bitses: [{ text: 'before' }, { text: 'other' }],
		});
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => { doodad.bitses[0].text = 'during'; });

		let row = await raw(this.surreal, 'f5');
		assert.strictEqual(row.bitses[0].text, 'during', 'the edit inside the element survived');
		assert.strictEqual(row.bitses[1].text, 'other', 'the sibling was untouched');
	});

	test('a record link set during a save is kept', async function (assert) {
		let author = await this.store.create('author', 'fa', { name: 'A' });
		let doodad = await this.store.create('doodad', 'f6', { text: 'x' });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => { doodad.link = author; });

		assert.strictEqual(String((await raw(this.surreal, 'f6')).link), 'author:fa', 'the link survived');
	});

	test('a field cleared during a save stays cleared', async function (assert) {
		let doodad = await this.store.create('doodad', 'f7', { text: 'x', count: 5 });
		await autosaved(doodad);

		doodad.text = 'y';
		await during(doodad, () => { doodad.count = 0; });

		assert.strictEqual((await raw(this.surreal, 'f7')).count, 0, 'the clearing survived');
	});

	test('an edit during a save is not lost when the server changed the same record', async function (assert) {
		let doodad = await this.store.create('doodad', 'f8', { text: 'x', count: 1 });
		await autosaved(doodad);

		doodad.text = 'y';
		let inflight = doodad.save();
		await wait(520);

		// Someone else writes a different field while our save is in flight.
		await this.surreal.query('UPDATE doodad:f8 SET flag = true');
		doodad.count = 42;

		await inflight;
		await autosaved(doodad);

		let row = await raw(this.surreal, 'f8');
		assert.strictEqual(row.text, 'y', 'our first edit landed');
		assert.strictEqual(row.count, 42, 'our in-flight edit landed');

		// The revealing assertion: `store.modify()` sends a PATCH of only
		// what this client actually changed (text, count), never a MERGE of
		// its whole `record.json` - which would carry this client's own
		// stale `flag: false` (it never learned about the other session's
		// write) and silently clobber the concurrent edit back to false.
		assert.true(row.flag, "the other session's concurrent write to an untouched field survived");
	});

	test('an any field holding keys a patch path cannot name still saves', async function (assert) {
		// SurrealDB splits a patch path on both `/` and `.` and supports no
		// escaping, so such an object is replaced wholesale instead of being
		// addressed member by member.
		let doodad = await this.store.create('doodad', 'f9', {
			blob: { 'a.b': 1, 'c/d': 2, plain: 3 },
		});
		await autosaved(doodad);

		let row = await raw(this.surreal, 'f9');
		assert.deepEqual(row.blob, { 'a.b': 1, 'c/d': 2, plain: 3 }, 'stored with the keys intact');

		doodad.blob = { 'a.b': 9, 'c/d': 2, plain: 3 };
		await autosaved(doodad);

		let updated = await raw(this.surreal, 'f9');
		assert.deepEqual(
			updated.blob,
			{ 'a.b': 9, 'c/d': 2, plain: 3 },
			'the change reached the right key rather than creating a nested one',
		);
	});

	test('an unchanged any field with awkward keys is not written repeatedly', async function (assert) {
		let doodad = await this.store.create('doodad', 'f10', {
			blob: { 'a.b': 1, 'c/d': 2 },
		});
		await autosaved(doodad);

		assert.false(doodad.dirty, 'not dirty with nothing changed');

		let writes = 0;
		let original = this.surreal.update.bind(this.surreal);
		this.surreal.update = function (...args) {
			writes++;
			return original(...args);
		};

		await this.store.select('doodad', doodad.id, { reload: true });
		await autosaved(doodad);

		assert.strictEqual(writes, 0, 'reloading it queued no write');
	});
});
