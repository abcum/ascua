import { module, test } from 'qunit';
import RecordArray from '@ascua/surreal/classes/types/array';

const number = (v) => Number(v) || 0;
const string = (v) => (v === null || v === undefined ? null : String(v));
const any = (v) => v;

// `RecordArray.create` builds the array behind every `@array(...)` field.
// `Array`'s constructor treats a single numeric argument as a length rather
// than a value, so building one by spreading its values into the constructor
// turned a one-element numeric array into holes — and the snapshot filters
// holes away, so the value did not arrive wrong, it disappeared.

module('Unit | surreal | record array create', function () {

	test('a single numeric value is an element, not a length', function (assert) {
		let arr = RecordArray.create(null, number, 1);

		assert.strictEqual(arr.length, 1, 'one element');
		assert.deepEqual([...arr], [1], 'holding the value it was given');
	});

	test('a single large number does not become that many holes', function (assert) {
		let arr = RecordArray.create(null, number, 5);

		assert.strictEqual(arr.length, 1, 'still one element');
		assert.deepEqual([...arr], [5], 'holding 5, not five empty slots');
	});

	test('a single zero survives', function (assert) {
		let arr = RecordArray.create(null, number, 0);

		assert.strictEqual(arr.length, 1, 'one element');
		assert.deepEqual([...arr], [0], 'holding zero');
	});

	test('several numbers are unaffected', function (assert) {
		let arr = RecordArray.create(null, number, 1, 2, 3);

		assert.deepEqual([...arr], [1, 2, 3], 'every element kept');
	});

	test('a single untyped number is an element too', function (assert) {
		// `@array()` with no type uses the identity mapper, so the same
		// constructor hazard applies.
		let arr = RecordArray.create(null, any, 3);

		assert.deepEqual([...arr], [3], 'holding the value');
	});

	test('strings were never affected and still work', function (assert) {
		let arr = RecordArray.create(null, string, 'x');

		assert.deepEqual([...arr], ['x'], 'one string element');
	});

	test('an empty array is empty', function (assert) {
		let arr = RecordArray.create(null, number);

		assert.strictEqual(arr.length, 0, 'no elements');
		assert.deepEqual([...arr], [], 'and nothing in it');
	});

	test('the mapper is applied to every element', function (assert) {
		let arr = RecordArray.create(null, number, '7', '8');

		assert.deepEqual([...arr], [7, 8], 'each element was coerced');
	});

	test('the mapper receives only the value, not the index', function (assert) {
		// Built with `map`, which passes (value, index, array). A mapper
		// declared with more than one parameter — `parseInt` being the
		// classic — would otherwise receive the index as a second argument.
		let seen = [];
		RecordArray.create(null, (...args) => {
			seen.push(args.length);
			return args[0];
		}, 'a', 'b');

		assert.deepEqual(seen, [1, 1], 'the mapper was called with one argument each time');
	});

	test('no holes are left behind for a snapshot to filter away', function (assert) {
		let arr = RecordArray.create(null, number, 4);

		assert.deepEqual(
			[...arr].filter((e) => e !== undefined),
			[4],
			'the value survives the snapshot filter in utils/json.js',
		);
	});
});
