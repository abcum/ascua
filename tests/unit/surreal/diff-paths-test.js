import { module, test } from 'qunit';
import Diff from '@ascua/surreal/classes/dmp/diff';
import Patch from '@ascua/surreal/classes/dmp/patch';

// `Diff` builds JSON-Pointer-style paths and `Patch` walks them back to
// re-apply in-flight local changes on top of incoming server state (see
// `Model#ingest`). Anything that survives a round trip through those two has
// to come back unchanged, including keys and values a naive path
// implementation would mangle.
//
// Only a declared field name reaches the top level of a path, and those are
// JS identifiers — but an `@any` field holds arbitrary keys, and so does any
// plain object nested inside one.

module('Unit | surreal | diff paths', function () {

	const ops = (old, now) => new Diff(old, now).output();

	const replay = (old, now) => new Patch(
		JSON.parse(JSON.stringify(old)),
		ops(old, now),
	).output();

	const roundTrips = (assert, old, now, label) => {
		assert.deepEqual(
			JSON.parse(JSON.stringify(replay(old, now))),
			JSON.parse(JSON.stringify(now)),
			label,
		);
	};

	// ------------------------------------------------------------------
	// Awkward keys
	// ------------------------------------------------------------------

	test('a key containing a dot round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { 'a.b': 1 } },
			{ blob: { 'a.b': 2 } },
			'a dotted key is not treated as a nested path',
		);
	});

	test('a key containing a slash round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { 'a/b': 1 } },
			{ blob: { 'a/b': 2 } },
			'a slashed key is not treated as a path separator',
		);
	});

	test('a key containing a tilde round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { 'a~b': 1 } },
			{ blob: { 'a~b': 2 } },
			'a tilde key survives',
		);
	});

	test('a key that looks like an array index round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { 0: 'zero' } },
			{ blob: { 0: 'one' } },
			'a numeric key on an object stays an object key',
		);
	});

	test('an empty-string key round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { '': 1 } },
			{ blob: { '': 2 } },
			'an empty key survives',
		);
	});

	test('a unicode key round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { 'naïve 🎩': 1 } },
			{ blob: { 'naïve 🎩': 2 } },
			'a unicode key survives',
		);
	});

	// ------------------------------------------------------------------
	// Awkward values
	// ------------------------------------------------------------------

	test('a null value round-trips', function (assert) {
		roundTrips(assert, { blob: { a: 1 } }, { blob: { a: null } }, 'set to null');
		roundTrips(assert, { blob: { a: null } }, { blob: { a: 1 } }, 'set from null');
	});

	test('nested empty containers round-trip', function (assert) {
		roundTrips(assert, { blob: {} }, { blob: { a: {} } }, 'an empty object added');
		roundTrips(assert, { blob: { a: [] } }, { blob: { a: [1] } }, 'an empty array filled');
		roundTrips(assert, { blob: { a: [1] } }, { blob: { a: [] } }, 'an array emptied');
	});

	test('an array of arrays round-trips', function (assert) {
		roundTrips(
			assert,
			{ blob: { a: [[1, 2], [3]] } },
			{ blob: { a: [[1, 9], [3]] } },
			'a change inside a nested array',
		);
	});

	test('an array of objects with nested arrays round-trips', function (assert) {
		roundTrips(
			assert,
			{ a: [{ tags: ['x'] }, { tags: ['y'] }] },
			{ a: [{ tags: ['x', 'z'] }, { tags: ['y'] }] },
			'a change to an array inside an element',
		);
	});

	test('a deeply nested change round-trips', function (assert) {
		roundTrips(
			assert,
			{ a: { b: { c: { d: { e: 1 } } } } },
			{ a: { b: { c: { d: { e: 2 } } } } },
			'five levels down',
		);
	});

	// ------------------------------------------------------------------
	// Array removals, which a path-based patch has to splice, not blank
	// ------------------------------------------------------------------

	test('removing the last array element round-trips', function (assert) {
		roundTrips(assert, { a: [1, 2, 3] }, { a: [1, 2] }, 'shortened by one');
	});

	test('removing several array elements round-trips', function (assert) {
		roundTrips(assert, { a: [1, 2, 3, 4] }, { a: [1] }, 'shortened by three');
	});

	test('replaying a removal leaves no holes behind', function (assert) {
		// `Patch` walks a path and assigns, so a removal implemented as
		// `delete arr[i]` would leave a hole rather than shortening the array
		// — and a hole is skipped by `forEach`, so the stale element it
		// stands in for is never overwritten when the result is applied back
		// onto a record.
		let result = replay({ a: [1, 2, 3] }, { a: [1] });

		assert.strictEqual(result.a.length, 1, 'the array really is shorter');
		assert.notOk(0 in result.a === false, 'index 0 is present');
		assert.deepEqual([...result.a], [1], 'and there are no holes in it');
	});

	test('growing and shrinking in one diff round-trips', function (assert) {
		roundTrips(assert, { a: [1], b: [1, 2, 3] }, { a: [1, 2, 3], b: [1] }, 'both directions at once');
	});

	// ------------------------------------------------------------------
	// Strings, which are patched as text diffs
	// ------------------------------------------------------------------

	test('a string with newlines and quotes round-trips', function (assert) {
		roundTrips(
			assert,
			{ text: 'line one\nline two' },
			{ text: 'line one\n"line" two\\three' },
			'text-diffed content survives',
		);
	});

	test('a string emptied and refilled round-trips', function (assert) {
		roundTrips(assert, { text: 'something' }, { text: '' }, 'emptied');
		roundTrips(assert, { text: '' }, { text: 'something' }, 'refilled');
	});

	test('a long string round-trips', function (assert) {
		let long = 'lorem ipsum dolor sit amet '.repeat(200);

		roundTrips(assert, { text: long }, { text: long + 'tail' }, 'a long text diff');
	});

	// ------------------------------------------------------------------
	// No spurious work
	// ------------------------------------------------------------------

	test('identical awkward structures produce no ops', function (assert) {
		let value = {
			blob: { 'a.b': 1, 'a/b': [1, { c: null }] },
			text: 'x',
			a: [[1], [2]],
		};

		assert.deepEqual(
			ops(JSON.parse(JSON.stringify(value)), JSON.parse(JSON.stringify(value))),
			[],
			'nothing to do',
		);
	});
});
