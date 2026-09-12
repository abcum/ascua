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
	setupSurreal(hooks, { reset: ['author', 'book', 'gadget'] });

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

	test('save() patches a changed field inside an array-of-Field element', async function (assert) {
		let book = await this.store.create('book', 'arrfield', {
			title: 'T',
			details: [{ isbn: 'AAA', pages: 1 }, { isbn: 'BBB', pages: 2 }],
		});

		book.details[0].isbn = 'CCC';
		await book.save();

		assert.strictEqual(book.details[0].isbn, 'CCC', 'the local record kept the new value after save()');

		let reloaded = await this.store.select('book', book.id, { reload: true });
		assert.strictEqual(reloaded.details[0].isbn, 'CCC', 'the change to the array element was patched on the server');
		assert.strictEqual(reloaded.details[1].isbn, 'BBB', 'the untouched sibling element was left alone');
	});

	test('save() patches a changed field on a single embedded object (Field)', async function (assert) {
		let book = await this.store.create('book', 'objfield', {
			title: 'T',
			detail: { isbn: 'AAA', pages: 1 },
		});

		book.detail.isbn = 'CCC';
		await book.save();

		assert.strictEqual(book.detail.isbn, 'CCC', 'the local record kept the new value after save()');

		let reloaded = await this.store.select('book', book.id, { reload: true });
		assert.strictEqual(reloaded.detail.isbn, 'CCC', 'the change to the embedded object was patched on the server');
		assert.strictEqual(reloaded.detail.pages, 1, 'the untouched sibling field was left alone');
	});

	test('autosave() on a field nested inside an array-of-Field element saves the owning record without being asked', async function (assert) {
		let gadget = await this.store.create('gadget', 'autoarr', {
			name: 'G',
			parts: [{ isbn: 'AAA', pages: 1 }],
		});

		gadget.parts[0].isbn = 'AUTO';
		// No explicit save() call - @autosave (applied to the Gadget model)
		// is expected to fire from the field setter itself
		// (classes/field/property.js), chained up through
		// Field#autosave()'s parent-delegation, same as a top-level field.
		// save() debounces 500ms before the actual request.
		await new Promise((resolve) => setTimeout(resolve, 900));

		let reloaded = await this.store.select('gadget', gadget.id, { reload: true });
		assert.strictEqual(reloaded.parts[0].isbn, 'AUTO', 'the change was autosaved without an explicit save() call');
	});

	test('save() patches a field mutated through a proxy on a linked record, without touching the owner', async function (assert) {
		let author = await this.store.create('author', 'linked', { name: 'Old Name' });
		let book = await this.store.create('book', 'proxyfield', { title: 'T', author });

		let reloadedBook = await this.store.select('book', book.id, { reload: true });

		// `reloadedBook.author` is a store proxy wrapping the linked author
		// record - mutating a field through it should autosave the AUTHOR,
		// not the book, and not require the book itself to be saved.
		reloadedBook.author.name = 'New Name';
		await reloadedBook.author.save();

		let reloadedAuthor = await this.store.select('author', author.id, { reload: true });
		assert.strictEqual(reloadedAuthor.name, 'New Name', 'the change made through the proxy was patched on the linked record');

		let reloadedBookAgain = await this.store.select('book', book.id, { reload: true });
		assert.strictEqual(reloadedBookAgain.title, 'T', 'the owning record was left untouched');
	});
});
