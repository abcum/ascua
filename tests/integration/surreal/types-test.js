import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// One of every field kind, on its own and in every position it can occupy.
// The edge values matter more than the ordinary ones: `0`, `false` and `''`
// are all falsy, and a snapshot that drops them (or a diff that cannot see
// them change) loses real data while looking like it saved.

scope('Integration | surreal | types', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	// ------------------------------------------------------------------
	// Strings
	// ------------------------------------------------------------------

	test('a string round-trips, including an empty one', async function (assert) {
		let doodad = await this.store.create('doodad', 's1', { text: 'hello' });
		assert.strictEqual(doodad.text, 'hello', 'set on create');

		doodad.text = '';
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT text FROM doodad:s1');
		assert.strictEqual(rows[0].text, '', 'an empty string is stored as an empty string, not dropped');
	});

	test('a string with characters that matter to a text diff round-trips', async function (assert) {
		// Scalar strings are patched with a DMP text diff (`change`), not a
		// wholesale replace, so the payload is a patch format of its own.
		let doodad = await this.store.create('doodad', 's2', { text: 'one' });

		for (const value of ['two', 'a "quoted" value', 'multi\nline\ntext', 'emoji 🎩 and — dashes', '']) {
			doodad.text = value;
			await autosaved(doodad);

			let [rows] = await this.surreal.query('SELECT text FROM doodad:s2');
			assert.strictEqual(rows[0].text, value, `round-tripped ${JSON.stringify(value)}`);
		}
	});

	test('a string that looks like a datetime is replaced rather than text-patched', async function (assert) {
		let doodad = await this.store.create('doodad', 's3', { text: 'plain' });

		doodad.text = '2026-09-14T12:00:00.000Z';
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT text FROM doodad:s3');
		assert.strictEqual(rows[0].text, '2026-09-14T12:00:00.000Z', 'stored intact');
	});

	// ------------------------------------------------------------------
	// Numbers
	// ------------------------------------------------------------------

	test('numbers round-trip, including zero and negatives', async function (assert) {
		let doodad = await this.store.create('doodad', 'n1', { count: 5 });

		for (const value of [0, -1, 3.5, -2.25, 1000000]) {
			doodad.count = value;
			await autosaved(doodad);

			let [rows] = await this.surreal.query('SELECT count FROM doodad:n1');
			assert.strictEqual(rows[0].count, value, `round-tripped ${value}`);
		}
	});

	test('a number changed to zero is saved as zero, not dropped', async function (assert) {
		// `0` is falsy, so a snapshot or diff that tests truthiness rather
		// than presence silently discards it.
		let doodad = await this.store.create('doodad', 'n2', { count: 42 });

		doodad.count = 0;
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT count FROM doodad:n2');
		assert.strictEqual(rows[0].count, 0, 'zero reached the server');
	});

	// ------------------------------------------------------------------
	// Booleans
	// ------------------------------------------------------------------

	test('booleans round-trip in both directions', async function (assert) {
		let doodad = await this.store.create('doodad', 'b1', { flag: true });

		let [first] = await this.surreal.query('SELECT flag FROM doodad:b1');
		assert.true(first[0].flag, 'true was stored');

		doodad.flag = false;
		await autosaved(doodad);

		let [second] = await this.surreal.query('SELECT flag FROM doodad:b1');
		assert.false(second[0].flag, 'false reached the server rather than being dropped as falsy');

		doodad.flag = true;
		await autosaved(doodad);

		let [third] = await this.surreal.query('SELECT flag FROM doodad:b1');
		assert.true(third[0].flag, 'and back to true');
	});

	// ------------------------------------------------------------------
	// Datetimes
	// ------------------------------------------------------------------

	test('a datetime round-trips as a real datetime, not a string', async function (assert) {
		let when = new Date('2026-09-14T12:34:56.000Z');
		let doodad = await this.store.create('doodad', 'd1', { when });

		let [rows] = await this.surreal.query('SELECT when, type::is_datetime(when) AS ok FROM doodad:d1');
		assert.true(rows[0].ok, 'stored with the datetime type, not as a string');

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
		assert.strictEqual(
			new Date(reloaded.when).toISOString(),
			when.toISOString(),
			'the same instant came back',
		);
	});

	test('a datetime accepts a Date, an ISO string and a change', async function (assert) {
		let doodad = await this.store.create('doodad', 'd2', {});

		doodad.when = new Date('2020-01-01T00:00:00.000Z');
		await autosaved(doodad);
		let [first] = await this.surreal.query('SELECT when FROM doodad:d2');
		assert.strictEqual(new Date(first[0].when).toISOString(), '2020-01-01T00:00:00.000Z', 'from a Date');

		doodad.when = '2021-06-30T10:20:30.000Z';
		await autosaved(doodad);
		let [second] = await this.surreal.query('SELECT when FROM doodad:d2');
		assert.strictEqual(new Date(second[0].when).toISOString(), '2021-06-30T10:20:30.000Z', 'from an ISO string');
	});

	test('setting the same datetime twice does not produce a write', async function (assert) {
		// A datetime is rebuilt into a fresh `DateTime` on every snapshot, so
		// comparing instances rather than values would make every record look
		// permanently dirty.
		let doodad = await this.store.create('doodad', 'd3', { when: new Date('2022-02-02T00:00:00.000Z') });
		await autosaved(doodad);

		assert.false(doodad.dirty, 'not dirty after saving');

		doodad.when = new Date('2022-02-02T00:00:00.000Z');
		assert.false(doodad.dirty, 'setting an equal datetime leaves nothing to save');
	});

	// ------------------------------------------------------------------
	// Any
	// ------------------------------------------------------------------

	test('an any field carries whatever it is given', async function (assert) {
		let doodad = await this.store.create('doodad', 'a1', { blob: { nested: { deep: 1 } } });

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
		assert.deepEqual(reloaded.blob, { nested: { deep: 1 } }, 'an object survived');

		doodad.blobs = [1, 'two', true];
		await autosaved(doodad);

		let refetched = await this.store.select('doodad', doodad.id, { reload: true });
		assert.deepEqual([...refetched.blobs], [1, 'two', true], 'and so did an array');
	});

	// ------------------------------------------------------------------
	// Primitive arrays
	// ------------------------------------------------------------------

	test('an array of strings round-trips and patches', async function (assert) {
		let doodad = await this.store.create('doodad', 'as1', { texts: ['a', 'b'] });

		doodad.texts.pushObject('c');
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT texts FROM doodad:as1');
		assert.deepEqual(rows[0].texts, ['a', 'b', 'c'], 'the push reached the server');
	});

	test('an array of numbers keeps zero and negative values', async function (assert) {
		let doodad = await this.store.create('doodad', 'an1', { counts: [1, 2] });

		doodad.counts = [0, -5, 3.5];
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT counts FROM doodad:an1');
		assert.deepEqual(rows[0].counts, [0, -5, 3.5], 'every element survived, including zero');
	});

	test('an array of booleans keeps false values', async function (assert) {
		let doodad = await this.store.create('doodad', 'ab1', { flags: [true, true] });

		doodad.flags = [false, true, false];
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT flags FROM doodad:ab1');
		assert.deepEqual(rows[0].flags, [false, true, false], 'false elements survived');
	});

	test('an array of datetimes round-trips as datetimes', async function (assert) {
		let doodad = await this.store.create('doodad', 'ad1', {
			whens: [new Date('2020-01-01T00:00:00.000Z'), new Date('2021-01-01T00:00:00.000Z')],
		});

		let [rows] = await this.surreal.query(
			'SELECT whens, array::all(whens.map(|$v| type::is_datetime($v))) AS ok FROM doodad:ad1',
		);
		assert.true(rows[0].ok, 'every element kept the datetime type');
		assert.strictEqual(rows[0].whens.length, 2, 'both elements present');
	});

	test('a primitive array coerces what it is given to its declared type', async function (assert) {
		let doodad = await this.store.create('doodad', 'ac1', {});

		doodad.counts.pushObject('7');
		doodad.texts.pushObject(9);
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT counts, texts FROM doodad:ac1');
		assert.deepEqual(rows[0].counts, [7], 'a numeric string became a number');
		assert.deepEqual(rows[0].texts, ['9'], 'a number became a string');
	});

	// ------------------------------------------------------------------
	// Record links
	// ------------------------------------------------------------------

	test('a record link stores a link and resolves back to the record', async function (assert) {
		let author = await this.store.create('author', 'ta1', { name: 'Linked' });
		await this.store.create('doodad', 'r1', { link: author });

		let [rows] = await this.surreal.query('SELECT link FROM doodad:r1');
		assert.ok(rows[0].link instanceof RecordId, 'stored as a record link');

		let reloaded = await this.store.select('doodad', 'doodad:r1', { reload: true });
		assert.strictEqual(reloaded.link.name, 'Linked', 'resolved back to the record');
	});

	test('a record link can be cleared', async function (assert) {
		let author = await this.store.create('author', 'ta2', { name: 'Linked' });
		let doodad = await this.store.create('doodad', 'r2', { link: author });

		doodad.link = null;
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT link FROM doodad:r2');
		assert.notOk(rows[0].link, 'the link was cleared on the server');
	});

	// ------------------------------------------------------------------
	// Embedded objects carrying every kind
	// ------------------------------------------------------------------

	test('every scalar kind round-trips inside an embedded object', async function (assert) {
		let doodad = await this.store.create('doodad', 'e1', {
			bits: {
				text: 'hello',
				count: 7,
				flag: true,
				when: new Date('2023-03-03T00:00:00.000Z'),
				texts: ['x'],
				counts: [1],
			},
		});

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });

		assert.strictEqual(reloaded.bits.text, 'hello', 'string');
		assert.strictEqual(reloaded.bits.count, 7, 'number');
		assert.true(reloaded.bits.flag, 'boolean');
		assert.strictEqual(new Date(reloaded.bits.when).toISOString(), '2023-03-03T00:00:00.000Z', 'datetime');
		assert.deepEqual([...reloaded.bits.texts], ['x'], 'array of strings');
		assert.deepEqual([...reloaded.bits.counts], [1], 'array of numbers');
	});

	test('every scalar kind patches inside an embedded object', async function (assert) {
		let doodad = await this.store.create('doodad', 'e2', {
			bits: { text: 'before', count: 1, flag: true },
		});

		doodad.bits.text = 'after';
		doodad.bits.count = 0;
		doodad.bits.flag = false;
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT bits FROM doodad:e2');
		assert.strictEqual(rows[0].bits.text, 'after', 'string patched');
		assert.strictEqual(rows[0].bits.count, 0, 'number patched to zero');
		assert.false(rows[0].bits.flag, 'boolean patched to false');
	});

	test('every scalar kind patches inside an array element', async function (assert) {
		let doodad = await this.store.create('doodad', 'e3', {
			bitses: [{ text: 'before', count: 1, flag: true }, { text: 'other' }],
		});

		doodad.bitses[0].text = 'after';
		doodad.bitses[0].count = 0;
		doodad.bitses[0].flag = false;
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT bitses FROM doodad:e3');
		assert.strictEqual(rows[0].bitses[0].text, 'after', 'string patched');
		assert.strictEqual(rows[0].bitses[0].count, 0, 'number patched to zero');
		assert.false(rows[0].bitses[0].flag, 'boolean patched to false');
		assert.strictEqual(rows[0].bitses[1].text, 'other', 'the sibling element was untouched');
	});

	test('an array nested inside an array element patches', async function (assert) {
		let doodad = await this.store.create('doodad', 'e4', {
			bitses: [{ text: 'a', texts: ['x'], counts: [1] }],
		});

		doodad.bitses[0].texts.pushObject('y');
		doodad.bitses[0].counts = [9, 8];
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT bitses FROM doodad:e4');
		assert.deepEqual(rows[0].bitses[0].texts, ['x', 'y'], 'the nested string array patched');
		assert.deepEqual(rows[0].bitses[0].counts, [9, 8], 'the nested number array patched');
	});
});
