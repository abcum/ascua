import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | surreal | store', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book'] });

	test('create yields a record with a native RecordId id', async function (assert) {
		let author = await this.store.create('author', 'ada', {
			name: 'Ada Lovelace',
			tags: ['math', 'computing'],
		});
		assert.ok(author.id instanceof RecordId, 'id is a native RecordId, not a string');
		assert.strictEqual(author.tb, 'author', 'tb is derived from the id');
		assert.strictEqual(String(author.id), 'author:ada', 'id stringifies to tb:id');
		assert.strictEqual(author.name, 'Ada Lovelace', 'scalar field round-trips');
		assert.deepEqual([...author.tags], ['math', 'computing'], 'array<string> field round-trips');
	});

	test('create returns one record whether or not an id is given', async function (assert) {
		// Creating without an id targets the table, and the SDK resolves a
		// table-targeted create to an array. `create` makes one record, so both
		// forms must hand back that record rather than the shape the SDK chose.

		let withId = await this.store.create('author', 'alan', { name: 'Alan Turing' });
		let without = await this.store.create('author', null, { name: 'Anita Borg' });

		assert.false(Array.isArray(withId), 'an explicit id yields a record');
		assert.false(Array.isArray(without), 'a null id also yields a record, not an array');

		assert.strictEqual(without.name, 'Anita Borg', 'fields are readable directly');
		assert.ok(without.id instanceof RecordId, 'id is a native RecordId');
		assert.strictEqual(without.tb, 'author', 'tb is derived from the generated id');

		let twoArg = await this.store.create('author', { name: 'Barbara Liskov' });

		assert.false(Array.isArray(twoArg), 'the two-argument form also yields a record');
		assert.strictEqual(twoArg.name, 'Barbara Liskov', 'and its fields are readable');
	});

	test('select reloads a record from the server with native ids', async function (assert) {
		let created = await this.store.create('author', 'grace', { name: 'Grace Hopper' });
		let found = await this.store.select('author', created.id, { reload: true });
		assert.ok(found.id instanceof RecordId, 'reloaded id is a native RecordId');
		assert.strictEqual(String(found.id), 'author:grace');
		assert.strictEqual(found.name, 'Grace Hopper');
	});

	test('search returns matching records and count totals', async function (assert) {
		await this.store.create('author', 'a1', { name: 'Alan Turing' });
		await this.store.create('author', 'a2', { name: 'Alan Kay' });
		await this.store.create('author', 'a3', { name: 'Edsger Dijkstra' });

		let alans = await this.store.search('author', {
			where: ['name = $name'],
			param: { name: 'Alan Turing' },
		});
		assert.strictEqual(alans.length, 1, 'where clause filters');
		assert.strictEqual(alans[0].name, 'Alan Turing');

		let total = await this.store.count('author');
		assert.strictEqual(total, 3, 'count() AS count / GROUP ALL builder works');
	});

	test('update merges changed fields', async function (assert) {
		let author = await this.store.create('author', 'edith', { name: 'Edith' });
		author.name = 'Edith Clarke';
		await author.update();

		let reloaded = await this.store.select('author', author.id, { reload: true });
		assert.strictEqual(reloaded.name, 'Edith Clarke', 'merge persisted the new value');
	});

	test('delete removes the record', async function (assert) {
		let author = await this.store.create('author', 'tmp', { name: 'Temp' });
		await author.delete();
		let total = await this.store.count('author');
		assert.strictEqual(total, 0, 'record removed on the server');
	});
});
