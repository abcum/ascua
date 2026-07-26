import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { RecordId } from 'surrealdb';

// The storage service encodes on write and decodes on read, so a value must
// come back out exactly as it went in. Before that was symmetric, anything
// whose JSON form is a scalar — a RecordId, a Date — was written as `"tb:id"`
// and read back with its quotes still attached.

const KEY = 'ascua-storage-test-key';

module('Unit | Service | storage', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		window.localStorage.removeItem(KEY);
		this.storage = this.owner.lookup('service:storage');
	});

	hooks.afterEach(function () {
		window.localStorage.removeItem(KEY);
	});

	// A value survives a write followed by a read unchanged.

	function roundtrip(name, value, assertion) {
		test(`round trips ${name}`, function (assert) {
			this.storage.set(KEY, value);
			assertion(assert, this.storage.get(KEY));
		});
	}

	roundtrip('a string', 'hello', (assert, got) => {
		assert.strictEqual(got, 'hello', 'the same string');
	});

	roundtrip('an empty string', '', (assert, got) => {
		assert.strictEqual(got, '', 'still an empty string, not undefined');
	});

	roundtrip('a string containing a colon', 'account:abc', (assert, got) => {
		assert.strictEqual(got, 'account:abc', 'no added quotes');
	});

	roundtrip('a number', 42, (assert, got) => {
		assert.strictEqual(got, 42, 'a number, not a string');
	});

	roundtrip('zero', 0, (assert, got) => {
		assert.strictEqual(
			got,
			0,
			'zero survives rather than becoming undefined',
		);
	});

	roundtrip('a negative float', -1.5, (assert, got) => {
		assert.strictEqual(got, -1.5, 'sign and fraction preserved');
	});

	roundtrip('true', true, (assert, got) => {
		assert.strictEqual(got, true, 'a boolean, not the string "true"');
	});

	roundtrip('false', false, (assert, got) => {
		assert.strictEqual(
			got,
			false,
			'false survives rather than becoming undefined',
		);
	});

	roundtrip('null', null, (assert, got) => {
		assert.strictEqual(got, null, 'null, not the string "null"');
	});

	roundtrip('an object', { a: 1, b: 'two' }, (assert, got) => {
		assert.deepEqual(got, { a: 1, b: 'two' }, 'the same object');
	});

	roundtrip(
		'a nested object',
		{ a: { b: [1, 2, { c: 3 }] } },
		(assert, got) => {
			assert.deepEqual(
				got,
				{ a: { b: [1, 2, { c: 3 }] } },
				'nesting preserved',
			);
		},
	);

	roundtrip('an empty object', {}, (assert, got) => {
		assert.deepEqual(got, {}, 'an empty object');
	});

	roundtrip('an array', [1, 'two', null], (assert, got) => {
		assert.deepEqual(got, [1, 'two', null], 'the same array');
	});

	roundtrip('an empty array', [], (assert, got) => {
		assert.deepEqual(got, [], 'an empty array, not an empty object');
	});

	// The regressions this rewrite exists to fix. Both of these have a scalar
	// JSON form, so the old read path refused to decode them.

	test('a RecordId round trips as its string form, without quotes', function (assert) {
		let id = new RecordId('account', 'abc');

		this.storage.set(KEY, id);

		assert.strictEqual(
			this.storage.get(KEY),
			'account:abc',
			'reads back as "account:abc" and not as "\\"account:abc\\""',
		);
	});

	test('a Date round trips as its ISO string, without quotes', function (assert) {
		let date = new Date('2026-07-26T12:00:00.000Z');

		this.storage.set(KEY, date);

		assert.strictEqual(
			this.storage.get(KEY),
			'2026-07-26T12:00:00.000Z',
			'no stray quotes',
		);
	});

	// Strings which happen to look like another type must stay strings, which
	// the old asymmetric encoding could not express.

	test('a string that looks like null stays a string', function (assert) {
		this.storage.set(KEY, 'null');
		assert.strictEqual(
			this.storage.get(KEY),
			'null',
			'the string, not null',
		);
	});

	test('a string that looks like a boolean stays a string', function (assert) {
		this.storage.set(KEY, 'true');
		assert.strictEqual(
			this.storage.get(KEY),
			'true',
			'the string, not true',
		);
	});

	test('a string that looks like a number stays a string', function (assert) {
		this.storage.set(KEY, '12');
		assert.strictEqual(this.storage.get(KEY), '12', 'the string, not 12');
	});

	test('a string containing JSON stays a string', function (assert) {
		this.storage.set(KEY, '{"a":1}');
		assert.strictEqual(
			this.storage.get(KEY),
			'{"a":1}',
			'the string, not an object',
		);
	});

	// Absent and unstorable values.

	test('an unset key reads as undefined', function (assert) {
		assert.strictEqual(this.storage.get(KEY), undefined, 'undefined');
	});

	test('setting undefined clears the key', function (assert) {
		this.storage.set(KEY, 'something');
		this.storage.set(KEY, undefined);

		assert.strictEqual(
			this.storage.get(KEY),
			undefined,
			'reads as undefined',
		);
		assert.strictEqual(
			window.localStorage.getItem(KEY),
			null,
			'and is removed',
		);
	});

	test('a value with no JSON form clears the key rather than storing "undefined"', function (assert) {
		this.storage.set(KEY, 'something');
		this.storage.set(KEY, function () {});

		assert.strictEqual(
			this.storage.get(KEY),
			undefined,
			'reads as undefined',
		);
		assert.strictEqual(
			window.localStorage.getItem(KEY),
			null,
			'and is removed',
		);
	});

	// Values written by the previous asymmetric encoding are still read
	// correctly, so an existing browser does not have to be reset.

	module('legacy values', function () {
		function legacy(name, raw, assertion) {
			test(`reads a legacy ${name}`, function (assert) {
				window.localStorage.setItem(KEY, raw);
				assertion(assert, this.storage.get(KEY));
			});
		}

		legacy('unquoted string', 'account:abc', (assert, got) => {
			assert.strictEqual(
				got,
				'account:abc',
				'returned as the string it is',
			);
		});

		legacy('null', 'null', (assert, got) => {
			assert.strictEqual(got, null, 'still decodes to null');
		});

		legacy('true', 'true', (assert, got) => {
			assert.strictEqual(got, true, 'still decodes to true');
		});

		legacy('false', 'false', (assert, got) => {
			assert.strictEqual(got, false, 'still decodes to false');
		});

		legacy('number', '42', (assert, got) => {
			assert.strictEqual(got, 42, 'still decodes to a number');
		});

		legacy('object', '{"a":1}', (assert, got) => {
			assert.deepEqual(got, { a: 1 }, 'still decodes to an object');
		});

		legacy('array', '[1,2]', (assert, got) => {
			assert.deepEqual(got, [1, 2], 'still decodes to an array');
		});
	});

	// Overwriting and property notification.

	test('overwrites an existing value', function (assert) {
		this.storage.set(KEY, 'first');
		this.storage.set(KEY, { second: true });

		assert.deepEqual(
			this.storage.get(KEY),
			{ second: true },
			'the newer value',
		);
	});

	test('changes the type of an existing value', function (assert) {
		this.storage.set(KEY, { a: 1 });
		this.storage.set(KEY, 7);

		assert.strictEqual(this.storage.get(KEY), 7, 'now a number');
	});

	test('a written object is a copy, not a live reference', function (assert) {
		let source = { a: 1 };

		this.storage.set(KEY, source);
		source.a = 2;

		assert.deepEqual(
			this.storage.get(KEY),
			{ a: 1 },
			'the value as it was written',
		);
	});
});
