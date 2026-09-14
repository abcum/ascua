import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import thing from '@ascua/surreal/utils/thing';
import { RecordId, StringRecordId, Table } from 'surrealdb';

module('Unit | surreal | thing', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.store = this.owner.lookup('service:store');
	});

	test('a Model instance unwraps to its own id', function (assert) {
		let id = new RecordId('author', 'ada');
		let model = this.store.lookup('author').create({ id });

		assert.strictEqual(thing('author', model), id, 'returned the model\'s own id, not a copy');
	});

	test('a RecordId is returned as-is, not re-keyed off its own bare .id', function (assert) {
		// A RecordId exposes its own `.id` too — the bare local part, table
		// stripped. Treating a RecordId like a Model and reading `.id` off it
		// would silently drop the table prefix.
		let id = new RecordId('author', 'ada');

		assert.strictEqual(thing('author', id), id, 'the same RecordId instance was returned');
	});

	test('a StringRecordId is returned as-is', function (assert) {
		let id = new StringRecordId('author:ada');

		assert.strictEqual(thing('author', id), id);
	});

	test('a full "table:id" string becomes a StringRecordId', function (assert) {
		let result = thing('author', 'author:ada');

		assert.ok(result instanceof StringRecordId, 'a StringRecordId was built');
		assert.strictEqual(String(result), 'author:ada');
	});

	test('a bare id is paired with the table into a RecordId', function (assert) {
		let result = thing('author', 'ada');

		assert.ok(result instanceof RecordId, 'a RecordId was built');
		assert.strictEqual(String(result), 'author:ada');
	});

	test('undefined or null targets the whole table', function (assert) {
		assert.ok(thing('author', undefined) instanceof Table, 'undefined targets the table');
		assert.ok(thing('author', null) instanceof Table, 'null targets the table');
	});
});
