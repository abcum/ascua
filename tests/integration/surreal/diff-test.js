import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | surreal | diff', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book'] });

	test('save() patches a changed scalar field', async function (assert) {
		let author = await this.store.create('author', 'edit1', { name: 'Old' });
		author.name = 'New';
		await author.save();

		let reloaded = await this.store.select('author', author.id, { reload: true });
		assert.strictEqual(reloaded.name, 'New', 'the scalar change was patched on the server');
	});

	test('save() patches a changed record-link field', async function (assert) {
		let a1 = await this.store.create('author', 'a1', { name: 'A One' });
		let a2 = await this.store.create('author', 'a2', { name: 'A Two' });
		let book = await this.store.create('book', 'bk', { title: 'T', author: a1 });

		book.author = a2;
		await book.save();

		let reloaded = await this.store.select('book', book.id, { reload: true });
		assert.ok(reloaded.author.id instanceof RecordId, 'reloaded link id is a native RecordId');
		assert.strictEqual(String(reloaded.author.id), 'author:a2', 'the record link was patched on the server');
	});

	test('save() patches a changed array<string> field', async function (assert) {
		let author = await this.store.create('author', 'tagz', { name: 'T', tags: ['x'] });
		author.tags = ['x', 'y'];
		await author.save();

		let reloaded = await this.store.select('author', author.id, { reload: true });
		assert.ok([...reloaded.tags].includes('y'), 'the array change was patched on the server');
	});
});
