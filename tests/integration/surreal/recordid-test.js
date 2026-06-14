import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | surreal | recordid', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book'] });

	test('a record-link field resolves to its native RecordId and linked record', async function (assert) {
		let ada = await this.store.create('author', 'ada', { name: 'Ada Lovelace' });
		await this.store.create('book', 'b1', { title: 'Notes', author: ada });

		let book = await this.store.select('book', 'book:b1', { reload: true });

		assert.ok(book.author.id instanceof RecordId, 'link id is a native RecordId, not a string');
		assert.strictEqual(String(book.author.id), 'author:ada', 'link id stringifies to tb:id');

		let author = await book.author;
		assert.strictEqual(author.name, 'Ada Lovelace', 'link resolves to the linked record');
	});

	test('an array of record links yields native RecordId elements', async function (assert) {
		let c1 = await this.store.create('author', 'c1', { name: 'First Contributor' });
		let c2 = await this.store.create('author', 'c2', { name: 'Second Contributor' });
		await this.store.create('book', 'b2', { title: 'Multi', contributors: [c1, c2] });

		let book = await this.store.select('book', 'book:b2', { reload: true });

		assert.strictEqual(book.contributors.length, 2, 'both links round-trip');
		assert.ok(book.contributors[0].id instanceof RecordId, 'first link id is a native RecordId');
		assert.ok(book.contributors[1].id instanceof RecordId, 'second link id is a native RecordId');
	});

	test('an embedded object field round-trips its nested values', async function (assert) {
		await this.store.create('book', 'b3', {
			title: 'D',
			detail: { isbn: '978-1', pages: 320 },
		});

		let book = await this.store.select('book', 'book:b3', { reload: true });

		assert.strictEqual(book.detail.isbn, '978-1', 'embedded string field round-trips');
		assert.strictEqual(book.detail.pages, 320, 'embedded number field round-trips');
	});
});
