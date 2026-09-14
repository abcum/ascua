import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import hasher from '@ascua/surreal/builders/hasher';
import table from '@ascua/surreal/builders/table';
import count from '@ascua/surreal/builders/count';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// The query surface `store.search` and `store.count` build. Every option here
// ends up in SQL sent to a real server, so the builders are checked by
// running what they produce rather than by matching strings.

scope('Integration | surreal | query builder', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	hooks.beforeEach(async function () {
		for (const [id, text, n] of [['q1', 'alpha', 3], ['q2', 'beta', 1], ['q3', 'gamma', 2]]) {
			await this.store.create('doodad', id, { text, count: n });
		}
	});

	// ------------------------------------------------------------------
	// Filtering
	// ------------------------------------------------------------------

	test('a where clause with a parameter filters', async function (assert) {
		let found = await this.store.search('doodad', {
			where: ['text = $text'],
			param: { text: 'beta' },
		});

		assert.strictEqual(found.length, 1, 'one match');
		assert.strictEqual(found[0].text, 'beta', 'the right one');
	});

	test('several where clauses are combined with AND', async function (assert) {
		let found = await this.store.search('doodad', {
			where: ['count > $min', 'count < $max'],
			param: { min: 1, max: 3 },
		});

		assert.strictEqual(found.length, 1, 'only the middle one matched');
		assert.strictEqual(found[0].text, 'gamma');
	});

	test('a parameter used more than once still filters correctly', async function (assert) {
		let found = await this.store.search('doodad', {
			where: ['count >= $n', 'count <= $n'],
			param: { n: 2 },
		});

		assert.strictEqual(found.length, 1, 'the bounds both applied');
		assert.strictEqual(found[0].text, 'gamma');
	});

	// ------------------------------------------------------------------
	// Ordering, limiting, paging
	// ------------------------------------------------------------------

	test('order sorts the results', async function (assert) {
		let found = await this.store.search('doodad', { order: 'count ASC' });

		assert.deepEqual(found.map((d) => d.count), [1, 2, 3], 'ascending');

		let desc = await this.store.search('doodad', { order: 'count DESC' });
		assert.deepEqual(desc.map((d) => d.count), [3, 2, 1], 'descending');
	});

	test('limit caps the number of results', async function (assert) {
		let found = await this.store.search('doodad', { order: 'count ASC', limit: 2 });

		assert.strictEqual(found.length, 2, 'two returned');
		assert.deepEqual(found.map((d) => d.count), [1, 2], 'the first two');
	});

	test('limit of one returns a single record rather than a list', async function (assert) {
		let found = await this.store.search('doodad', { order: 'count ASC', limit: 1 });

		assert.false(Array.isArray(found), 'not an array');
		assert.strictEqual(found.count, 1, 'the first record');
	});

	test('start pages past the first results', async function (assert) {
		let found = await this.store.search('doodad', { order: 'count ASC', limit: 2, start: 1 });

		assert.deepEqual(found.map((d) => d.count), [2, 3], 'skipped the first');
	});

	test('fetch resolves a link server-side', async function (assert) {
		let author = await this.store.create('author', 'qa', { name: 'Fetched' });
		await this.store.create('doodad', 'q4', { text: 'linked', link: author });

		let found = await this.store.search('doodad', {
			where: ['text = $text'],
			param: { text: 'linked' },
			fetch: ['link'],
		});

		assert.strictEqual(found.length, 1, 'found it');
		assert.strictEqual(found[0].link.name, 'Fetched', 'the link resolved');
	});

	// ------------------------------------------------------------------
	// Counting
	// ------------------------------------------------------------------

	test('count totals every record', async function (assert) {
		assert.strictEqual(await this.store.count('doodad'), 3, 'all three');
	});

	test('count respects a where clause', async function (assert) {
		let total = await this.store.count('doodad', {
			where: ['count > $min'],
			param: { min: 1 },
		});

		assert.strictEqual(total, 2, 'only the matching records');
	});

	test('count of nothing is zero, not undefined', async function (assert) {
		let total = await this.store.count('doodad', {
			where: ['text = $text'],
			param: { text: 'nothing matches this' },
		});

		assert.strictEqual(total, 0, 'an empty result counts as zero');
	});

	test('count of an empty table is zero', async function (assert) {
		assert.strictEqual(await this.store.count('author'), 0, 'no authors yet');
	});

	// ------------------------------------------------------------------
	// Searching does not disturb the cache
	// ------------------------------------------------------------------

	test('search returns the cached instances, updated', async function (assert) {
		let cached = this.store.cached('doodad', 'doodad:q1');

		let found = await this.store.search('doodad', {
			where: ['text = $text'],
			param: { text: 'alpha' },
		});

		assert.strictEqual(found[0], cached, 'the same object, not a copy');
	});

	test('a search that matches nothing returns an empty list', async function (assert) {
		let found = await this.store.search('doodad', {
			where: ['text = $text'],
			param: { text: 'no such thing' },
		});

		assert.deepEqual(found, [], 'empty rather than undefined');
	});

	// ------------------------------------------------------------------
	// The builders themselves
	// ------------------------------------------------------------------

	test('the table builder parameterises the table name', function (assert) {
		let { text, vars } = table('doodad', {});

		assert.ok(text.includes('type::table($tb)'), 'the table is a parameter, not interpolated');
		assert.strictEqual(vars.tb, 'doodad', 'and is passed as one');
	});

	test('the count builder groups all', function (assert) {
		let { text } = count('doodad', {});

		assert.ok(text.includes('count() AS count'), 'counts');
		assert.ok(text.includes('GROUP ALL'), 'over the whole table');
	});

	test('the hash distinguishes queries that differ', function (assert) {
		let base = { where: ['text = $text'], param: { text: 'a' } };

		assert.notStrictEqual(
			hasher('doodad', base),
			hasher('doodad', { ...base, param: { text: 'b' } }),
			'a different parameter value hashes differently',
		);

		assert.notStrictEqual(
			hasher('doodad', base),
			hasher('author', base),
			'a different table hashes differently',
		);

		assert.notStrictEqual(
			hasher('doodad', base),
			hasher('doodad', { ...base, limit: 1 }),
			'a different limit hashes differently',
		);

		assert.notStrictEqual(
			hasher('doodad', base),
			hasher('doodad', { ...base, order: 'text ASC' }),
			'a different order hashes differently',
		);
	});

	test('the hash is stable for the same query', function (assert) {
		let query = () => ({ where: ['text = $text'], param: { text: 'a' }, limit: 2 });

		assert.strictEqual(
			hasher('doodad', query()),
			hasher('doodad', query()),
			'the same query hashes the same twice',
		);
	});
});
