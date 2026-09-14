import { module, test } from 'qunit';
import Diff from '@ascua/surreal/classes/dmp/diff';

// `Diff.arr()` decides whether an array element changed by stringifying both
// sides and comparing. These tests pin that comparison down for nested
// shapes: an array of objects each holding a further object and an array is
// exactly what `contact.fields`, `contact.emails` and `contact.weburls` are,
// and a comparison that cannot see inside an element produces no patch at all
// for a change the user just made.

module('Unit | surreal | diff nested', function () {

	test('a change to a top-level value inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ code: 'AAA' }] },
			{ specs: [{ code: 'BBB' }] },
		).output();

		assert.ok(ops.length > 0, 'a change was detected');
	});

	test('a change to a nested object inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ code: 'AAA', note: { text: 'before' } }] },
			{ specs: [{ code: 'AAA', note: { text: 'after' } }] },
		).output();

		assert.ok(ops.length > 0, 'a change one level inside an element was detected');
	});

	test('a change to a doubly-nested object inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ note: { inner: { text: 'before' } } }] },
			{ specs: [{ note: { inner: { text: 'after' } } }] },
		).output();

		assert.ok(ops.length > 0, 'a change two levels inside an element was detected');
	});

	test('a change to an array nested inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ code: 'AAA', tags: ['x'] }] },
			{ specs: [{ code: 'AAA', tags: ['x', 'y'] }] },
		).output();

		assert.ok(ops.length > 0, 'a nested array change inside an element was detected');
	});

	test('a key added to a nested object inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ note: {} }] },
			{ specs: [{ note: { text: 'new' } }] },
		).output();

		assert.ok(ops.length > 0, 'an added nested key inside an element was detected');
	});

	test('a key removed from a nested object inside an array element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ note: { text: 'gone' } }] },
			{ specs: [{ note: {} }] },
		).output();

		assert.ok(ops.length > 0, 'a removed nested key inside an element was detected');
	});

	test('two identical nested elements produce no ops', function (assert) {
		let ops = new Diff(
			{ specs: [{ code: 'AAA', note: { text: 'same' }, tags: ['x'] }] },
			{ specs: [{ code: 'AAA', note: { text: 'same' }, tags: ['x'] }] },
		).output();

		assert.deepEqual(ops, [], 'no spurious ops for an unchanged nested element');
	});

	test('a nested change in the second element is detected', function (assert) {
		let ops = new Diff(
			{ specs: [{ note: { text: 'a' } }, { note: { text: 'b' } }] },
			{ specs: [{ note: { text: 'a' } }, { note: { text: 'CHANGED' } }] },
		).output();

		assert.ok(ops.length > 0, 'a nested change in a later element was detected');
	});
});
