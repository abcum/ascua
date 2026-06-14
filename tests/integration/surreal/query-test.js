import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | surreal | query', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book'] });

	test('raw query resolves to a bare array of per-statement result-sets', async function (assert) {
		await this.store.create('author', 'ada', { name: 'Ada Lovelace' });

		let res = await this.surreal.query('SELECT * FROM author');
		assert.ok(Array.isArray(res), 'top level is an array of result-sets');
		assert.ok(Array.isArray(res[0]), 'each statement yields an array of rows');
		assert.strictEqual(res[0].length, 1, 'the single row is returned');
		assert.ok(res[0][0].id instanceof RecordId, 'row id is a native RecordId');
		assert.strictEqual(String(res[0][0].id), 'author:ada', 'id stringifies to tb:id');
	});

	test('builder count and search filter the matching records', async function (assert) {
		await this.store.create('author', 'a1', { name: 'Alan Turing' });
		await this.store.create('author', 'a2', { name: 'Alan Kay' });
		await this.store.create('author', 'a3', { name: 'Edsger Dijkstra' });

		let total = await this.store.count('author');
		assert.strictEqual(total, 3, 'count() builder totals all records');

		let matches = await this.store.search('author', {
			where: ['name = $n'],
			param: { n: 'Alan Kay' },
		});
		assert.strictEqual(matches.length, 1, 'where clause filters to one match');
		assert.strictEqual(matches[0].name, 'Alan Kay', 'the right record is returned');
	});

	test('full-text search matches the analyzed prefix', async function (assert) {
		await this.store.create('author', 'j1', { name: 'Jane Smith' });
		await this.store.create('author', 'j2', { name: 'Janet Doe' });
		await this.store.create('author', 'b1', { name: 'Bob Jones' });

		let [hits] = await this.surreal.query(
			'SELECT name FROM author WHERE name @@ $q',
			{ q: 'jan' },
		);
		assert.strictEqual(hits.length, 2, 'edgengram prefix matches Jane and Janet, not Bob');
	});
});
