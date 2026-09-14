import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Every way an array field can be mutated. These all route through the
// `RecordArray` proxy's `set` trap, which is what both notifies templates and
// triggers the owning record's autosave — so a method that mutates the array
// without tripping that trap changes the screen and saves nothing.

scope('Integration | surreal | array mutations', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	// Read the stored value back through a raw query, bypassing the
	// connector, so a value that only ever existed locally is visible.
	async function stored(surreal, field, id) {
		let [rows] = await surreal.query(`SELECT ${field} FROM doodad:${id}`);
		return rows[0] && rows[0][field];
	}

	// ------------------------------------------------------------------
	// Primitive arrays
	// ------------------------------------------------------------------

	test('pushObject appends and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm1', { texts: ['a'] });

		doodad.texts.pushObject('b');
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm1'), ['a', 'b']);
	});

	test('pushObjects appends several and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm2', { texts: ['a'] });

		doodad.texts.pushObjects(['b', 'c']);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm2'), ['a', 'b', 'c']);
	});

	test('unshiftObject prepends and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm3', { texts: ['b'] });

		doodad.texts.unshiftObject('a');
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm3'), ['a', 'b']);
	});

	test('popObject removes the last and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm4', { texts: ['a', 'b'] });

		doodad.texts.popObject();
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm4'), ['a']);
	});

	test('shiftObject removes the first and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm5', { texts: ['a', 'b'] });

		doodad.texts.shiftObject();
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm5'), ['b']);
	});

	test('removeObject removes by value and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm6', { texts: ['a', 'b', 'c'] });

		doodad.texts.removeObject('b');
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm6'), ['a', 'c']);
	});

	test('removeObjects removes several and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm7', { texts: ['a', 'b', 'c'] });

		doodad.texts.removeObjects(['a', 'c']);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm7'), ['b']);
	});

	test('removeAt removes by index and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm8', { texts: ['a', 'b', 'c'] });

		doodad.texts.removeAt(1);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm8'), ['a', 'c']);
	});

	test('removeAt with a length removes a run and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm9', { texts: ['a', 'b', 'c', 'd'] });

		doodad.texts.removeAt(1, 2);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm9'), ['a', 'd']);
	});

	test('replace swaps a run and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm10', { texts: ['a', 'b', 'c'] });

		doodad.texts.replace(1, 1, ['B']);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm10'), ['a', 'B', 'c']);
	});

	test('setObjects replaces the contents and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm11', { texts: ['a', 'b'] });

		doodad.texts.setObjects(['x', 'y', 'z']);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm11'), ['x', 'y', 'z']);
	});

	test('clear empties the array and saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm12', { texts: ['a', 'b'] });

		doodad.texts.clear();
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm12'), []);
	});

	test('addObject does not add a duplicate', async function (assert) {
		let doodad = await this.store.create('doodad', 'm13', { texts: ['a'] });

		doodad.texts.addObject('a');
		doodad.texts.addObject('b');
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm13'), ['a', 'b']);
	});

	test('addObjects adds only the new ones', async function (assert) {
		let doodad = await this.store.create('doodad', 'm14', { texts: ['a'] });

		doodad.texts.addObjects(['a', 'b', 'c']);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm14'), ['a', 'b', 'c']);
	});

	test('a direct index assignment saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm15', { texts: ['a', 'b'] });

		doodad.texts[1] = 'B';
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'texts', 'm15'), ['a', 'B']);
	});

	test('mutating a numeric array saves, including down to one element', async function (assert) {
		let doodad = await this.store.create('doodad', 'm16', { counts: [1, 2, 3] });

		doodad.counts.removeAt(0, 2);
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'counts', 'm16'), [3], 'one numeric element survived');
	});

	// ------------------------------------------------------------------
	// Arrays of embedded objects
	// ------------------------------------------------------------------

	test('pushing an embedded object saves it with its nested values', async function (assert) {
		let doodad = await this.store.create('doodad', 'm20', { bitses: [{ text: 'a' }] });

		doodad.bitses.pushObject({ text: 'b', count: 2, texts: ['t'] });
		await autosaved(doodad);

		let bitses = await stored(this.surreal, 'bitses', 'm20');
		assert.strictEqual(bitses.length, 2, 'both elements stored');
		assert.strictEqual(bitses[1].text, 'b', 'with its scalar');
		assert.strictEqual(bitses[1].count, 2, 'its number');
		assert.deepEqual(bitses[1].texts, ['t'], 'and its nested array');
	});

	test('a pushed embedded object is a live Field that autosaves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm21', { bitses: [] });

		doodad.bitses.pushObject({ text: 'a' });
		await autosaved(doodad);

		// Edit through the element that was pushed, not a reloaded copy.
		doodad.bitses[0].text = 'edited';
		await autosaved(doodad);

		let bitses = await stored(this.surreal, 'bitses', 'm21');
		assert.strictEqual(bitses[0].text, 'edited', 'the pushed element saves its own later edits');
	});

	test('removing an embedded object saves', async function (assert) {
		let doodad = await this.store.create('doodad', 'm22', {
			bitses: [{ text: 'a' }, { text: 'b' }],
		});

		doodad.bitses.removeAt(0);
		await autosaved(doodad);

		let bitses = await stored(this.surreal, 'bitses', 'm22');
		assert.strictEqual(bitses.length, 1, 'one element left');
		assert.strictEqual(bitses[0].text, 'b', 'the right one');
	});

	test('reordering embedded objects saves the new order', async function (assert) {
		let doodad = await this.store.create('doodad', 'm23', {
			bitses: [{ text: 'a' }, { text: 'b' }],
		});

		doodad.bitses.setObjects([{ text: 'b' }, { text: 'a' }]);
		await autosaved(doodad);

		let bitses = await stored(this.surreal, 'bitses', 'm23');
		assert.deepEqual(bitses.map((b) => b.text), ['b', 'a'], 'the order was persisted');
	});

	// ------------------------------------------------------------------
	// Arrays of record links
	// ------------------------------------------------------------------

	test('every removal method works on an array of record links', async function (assert) {
		let a = await this.store.create('author', 'ma', { name: 'A' });
		let b = await this.store.create('author', 'mb', { name: 'B' });
		let c = await this.store.create('author', 'mc', { name: 'C' });

		let doodad = await this.store.create('doodad', 'm30', { links: [a, b, c] });

		doodad.links.removeAt(1);
		await autosaved(doodad);

		let links = await stored(this.surreal, 'links', 'm30');
		assert.deepEqual(links.map(String), ['author:ma', 'author:mc'], 'the middle link was removed');

		doodad.links.clear();
		await autosaved(doodad);

		assert.deepEqual(await stored(this.surreal, 'links', 'm30'), [], 'and the array emptied');
	});

	// ------------------------------------------------------------------
	// Dirtiness
	// ------------------------------------------------------------------

	test('a mutation marks the record dirty and a save clears it', async function (assert) {
		let doodad = await this.store.create('doodad', 'm40', { texts: ['a'] });
		await autosaved(doodad);

		assert.false(doodad.dirty, 'clean after its initial save');

		doodad.texts.pushObject('b');
		assert.true(doodad.dirty, 'dirty as soon as the array is mutated');

		await autosaved(doodad);
		assert.false(doodad.dirty, 'clean again once saved');
	});

	test('a no-op mutation leaves the record clean', async function (assert) {
		let doodad = await this.store.create('doodad', 'm41', { texts: ['a'] });
		await autosaved(doodad);

		doodad.texts.addObject('a');
		doodad.texts.removeObject('nothing-like-this');

		assert.false(doodad.dirty, 'nothing changed, so nothing to save');
	});
});
