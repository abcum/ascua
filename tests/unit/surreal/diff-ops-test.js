import { module, test } from 'qunit';
import Diff from '@ascua/surreal/classes/dmp/diff';
import Patch from '@ascua/surreal/classes/dmp/patch';
import { RecordId, DateTime } from 'surrealdb';

// The exact operations `Diff` emits. These are the payload sent to SurrealDB
// as a PATCH, so their shape is a contract with the server, not an internal
// detail — and `Patch` has to be able to replay them, since `ingest` uses it
// to re-apply in-flight local changes on top of incoming server state.

module('Unit | surreal | diff ops', function () {

	const ops = (old, now) => new Diff(old, now).output();

	// ------------------------------------------------------------------
	// Scalars
	// ------------------------------------------------------------------

	test('a new key is an add', function (assert) {
		assert.deepEqual(ops({}, { name: 'Ada' }), [
			{ op: 'add', path: '/name', value: 'Ada' },
		]);
	});

	test('a removed key is a remove', function (assert) {
		let result = ops({ name: 'Ada' }, {});

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].op, 'remove', 'a remove');
		assert.strictEqual(result[0].path, '/name', 'at the field path');
	});

	test('a changed string is a text patch, not a replace', function (assert) {
		let result = ops({ name: 'Ada' }, { name: 'Bob' });

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].op, 'change', 'a DMP text change');
		assert.strictEqual(result[0].path, '/name', 'at the field path');
	});

	test('a changed number is a replace', function (assert) {
		assert.deepEqual(ops({ n: 1 }, { n: 2 }), [
			{ op: 'replace', path: '/n', value: 2 },
		]);
	});

	test('a changed boolean is a replace, including to false', function (assert) {
		assert.deepEqual(ops({ b: true }, { b: false }), [
			{ op: 'replace', path: '/b', value: false },
		]);
	});

	test('a number changed to zero is still a replace', function (assert) {
		assert.deepEqual(ops({ n: 7 }, { n: 0 }), [
			{ op: 'replace', path: '/n', value: 0 },
		]);
	});

	test('a change of type is a replace', function (assert) {
		assert.deepEqual(ops({ v: 'one' }, { v: 1 }), [
			{ op: 'replace', path: '/v', value: 1 },
		]);
	});

	test('identical values produce no ops', function (assert) {
		assert.deepEqual(ops({ a: 1, b: 'x', c: true }, { a: 1, b: 'x', c: true }), []);
	});

	// ------------------------------------------------------------------
	// SurrealDB value types
	// ------------------------------------------------------------------

	test('a changed record link is replaced with the native RecordId', function (assert) {
		let before = new RecordId('author', 'one');
		let after = new RecordId('author', 'two');

		let result = ops({ link: before }, { link: after });

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].op, 'replace', 'a replace');
		assert.strictEqual(result[0].value, after, 'carrying the RecordId instance itself, not a string');
	});

	test('an unchanged record link produces no ops even as a different instance', function (assert) {
		assert.deepEqual(
			ops({ link: new RecordId('author', 'one') }, { link: new RecordId('author', 'one') }),
			[],
			'compared by value, not by identity',
		);
	});

	test('an unchanged datetime produces no ops even as a different instance', function (assert) {
		let iso = '2026-01-01T00:00:00.000Z';

		assert.deepEqual(
			ops({ when: new DateTime(new Date(iso)) }, { when: new DateTime(new Date(iso)) }),
			[],
			'a snapshot rebuilding its DateTime does not make the record dirty',
		);
	});

	test('a changed datetime is a replace carrying the DateTime', function (assert) {
		let after = new DateTime(new Date('2027-01-01T00:00:00.000Z'));

		let result = ops(
			{ when: new DateTime(new Date('2026-01-01T00:00:00.000Z')) },
			{ when: after },
		);

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].value, after, 'the native DateTime reaches the SDK');
	});

	// ------------------------------------------------------------------
	// Arrays
	// ------------------------------------------------------------------

	test('a longer array adds at the new indices', function (assert) {
		assert.deepEqual(ops({ a: ['x'] }, { a: ['x', 'y'] }), [
			{ op: 'add', path: '/a/1', value: 'y' },
		]);
	});

	test('a shorter array removes from the end', function (assert) {
		let result = ops({ a: ['x', 'y'] }, { a: ['x'] });

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].op, 'remove', 'a remove');
		assert.strictEqual(result[0].path, '/a/1', 'at the dropped index');
	});

	test('a changed element replaces the whole array, at an index-free path', function (assert) {
		// A replace whose path runs through an array index is silently
		// dropped by SurrealDB, so an in-place element change has to be sent
		// as a replace of the array itself.
		assert.deepEqual(ops({ a: ['x', 'y'] }, { a: ['X', 'y'] }), [
			{ op: 'replace', path: '/a', value: ['X', 'y'] },
		]);
	});

	test('an emptied array removes every index', function (assert) {
		let result = ops({ a: ['x', 'y'] }, { a: [] });

		assert.strictEqual(result.length, 2, 'one op per dropped element');
		assert.ok(result.every((o) => o.op === 'remove'), 'all removes');
	});

	test('an unchanged array produces no ops', function (assert) {
		assert.deepEqual(ops({ a: ['x', 'y'] }, { a: ['x', 'y'] }), []);
	});

	// ------------------------------------------------------------------
	// Nesting
	// ------------------------------------------------------------------

	test('a nested object change is patched at its own path', function (assert) {
		let result = ops({ o: { n: 1 } }, { o: { n: 2 } });

		assert.deepEqual(result, [{ op: 'replace', path: '/o/n', value: 2 }]);
	});

	test('a change inside an array element replaces the array', function (assert) {
		let result = ops(
			{ a: [{ n: { deep: 1 } }] },
			{ a: [{ n: { deep: 2 } }] },
		);

		assert.strictEqual(result.length, 1, 'one op');
		assert.strictEqual(result[0].op, 'replace', 'a replace');
		assert.strictEqual(result[0].path, '/a', 'of the whole array');
	});

	// ------------------------------------------------------------------
	// Round-tripping through Patch
	// ------------------------------------------------------------------

	test('Patch replays every op Diff produces', function (assert) {
		let cases = [
			[{}, { name: 'Ada' }],
			[{ name: 'Ada' }, { name: 'Bob' }],
			[{ n: 1 }, { n: 0 }],
			[{ b: true }, { b: false }],
			[{ o: { n: 1 } }, { o: { n: 2 } }],
			[{ a: ['x'] }, { a: ['x', 'y'] }],
			[{ a: ['x', 'y'] }, { a: ['X', 'y'] }],
			[{ a: [{ deep: 1 }] }, { a: [{ deep: 2 }] }],
		];

		for (const [before, after] of cases) {
			let replayed = new Patch(
				JSON.parse(JSON.stringify(before)),
				ops(before, after),
			).output();

			assert.deepEqual(
				JSON.parse(JSON.stringify(replayed)),
				JSON.parse(JSON.stringify(after)),
				`replaying ${JSON.stringify(before)} -> ${JSON.stringify(after)}`,
			);
		}
	});
});
