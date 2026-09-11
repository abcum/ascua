import { module, test } from 'qunit';
import { anyBy } from '@ascua/arrays/helpers/any-by';
import { everyBy } from '@ascua/arrays/helpers/every-by';
import { filterBy } from '@ascua/arrays/helpers/filter-by';
import { findBy } from '@ascua/arrays/helpers/find-by';
import { mapBy } from '@ascua/arrays/helpers/map-by';
import { rejectBy } from '@ascua/arrays/helpers/reject-by';
import { searchBy } from '@ascua/arrays/helpers/search-by';
import { sortBy } from '@ascua/arrays/helpers/sort-by';
import { union } from '@ascua/arrays/helpers/union';
import { uniqBy } from '@ascua/arrays/helpers/uniq-by';
import { without } from '@ascua/arrays/helpers/without';
import { compact } from '@ascua/arrays/helpers/compact';

// These helpers used to delegate to Ember's Array prototype extensions
// (EXTEND_PROTOTYPES.Array) - filterBy/sortBy/mapBy/findBy/rejectBy/any/
// uniq/union/without/compact - deprecated and removed in ember-source 6.0.
// They were reimplemented against native Array methods (or Set, or
// @ember/utils' compare), and this file exercises the branches that
// reimplementation touched.

function fixture() {
	return [
		{ name: 'ada', active: true },
		{ name: 'grace', active: false },
		{ name: 'alan', active: true },
	];
}

module('Unit | arrays | helpers', function () {
	module('map-by', function () {
		// The rewrite's own regression: the function branch called
		// `array.map(thing)`, a variable defined nowhere in scope. Every hit
		// threw a ReferenceError, regardless of EXTEND_PROTOTYPES - calling
		// map-by with a function param must not throw, and must return the
		// mapped values.
		test('maps with a function param', function (assert) {
			assert.deepEqual(
				mapBy([(p) => p.name.toUpperCase(), fixture()]),
				['ADA', 'GRACE', 'ALAN'],
				'mapped with the function, no ReferenceError',
			);
		});

		test('maps with a key param', function (assert) {
			assert.deepEqual(
				mapBy(['name', fixture()]),
				['ada', 'grace', 'alan'],
				'mapped by key',
			);
		});

		test('an empty param maps the values unchanged', function (assert) {
			assert.deepEqual(
				mapBy([undefined, [1, 2, 3]]),
				[1, 2, 3],
				'identity map',
			);
		});
	});

	module('filter-by', function () {
		test('a function param filters with the function', function (assert) {
			assert.deepEqual(
				filterBy([(p) => p.active, fixture()]).map((p) => p.name),
				['ada', 'alan'],
				'active only',
			);
		});

		test('a key param with no value filters by truthiness', function (assert) {
			assert.deepEqual(
				filterBy(['active', fixture()]).map((p) => p.name),
				['ada', 'alan'],
				'truthy active',
			);
		});

		test('a key and value filters by equality', function (assert) {
			assert.deepEqual(
				filterBy(['name', 'grace', fixture()]).map((p) => p.name),
				['grace'],
				'exact match only',
			);
		});
	});

	module('find-by', function () {
		test('a function param finds with the function', function (assert) {
			assert.strictEqual(
				findBy([(p) => p.active, fixture()]).name,
				'ada',
				'first match',
			);
		});

		test('a key param with no value finds by truthiness', function (assert) {
			assert.strictEqual(
				findBy(['active', fixture()]).name,
				'ada',
				'first truthy',
			);
		});

		test('a key and value finds by equality', function (assert) {
			assert.strictEqual(
				findBy(['name', 'alan', fixture()]).name,
				'alan',
				'exact match',
			);
		});
	});

	module('reject-by', function () {
		test('a function param rejects with the function', function (assert) {
			assert.deepEqual(
				rejectBy([(p) => p.active, fixture()]).map((p) => p.name),
				['grace'],
				'inactive only',
			);
		});

		test('a key param with no value rejects by truthiness', function (assert) {
			assert.deepEqual(
				rejectBy(['active', fixture()]).map((p) => p.name),
				['grace'],
				'not active',
			);
		});

		test('a key and value rejects by equality', function (assert) {
			assert.deepEqual(
				rejectBy(['name', 'grace', fixture()]).map((p) => p.name),
				['ada', 'alan'],
				'everyone but the exact match',
			);
		});
	});

	module('any-by', function () {
		test('a function param checks with the function', function (assert) {
			assert.true(
				anyBy([(p) => p.name === 'alan', fixture()]),
				'alan is in there',
			);
		});

		test('a key with an explicit undefined value checks truthiness', function (assert) {
			assert.true(
				anyBy(['active', undefined, fixture()]),
				'ada and alan are active',
			);
		});

		test('a key and value checks equality', function (assert) {
			assert.false(
				anyBy(['name', 'nobody', fixture()]),
				'no one is named nobody',
			);
		});
	});

	module('every-by', function () {
		test('a function param checks with the function', function (assert) {
			assert.false(
				everyBy([(p) => p.active, fixture()]),
				'grace is not active',
			);
		});

		test('a key with an explicit undefined value checks truthiness', function (assert) {
			assert.false(
				everyBy(['active', undefined, fixture()]),
				'not everyone is active',
			);
		});

		test('a key and value checks equality', function (assert) {
			let allActive = [fixture()[0], fixture()[2]];
			assert.true(
				everyBy(['active', true, allActive]),
				'both are active',
			);
		});
	});

	module('search-by', function () {
		// `.uniq()` used to dedupe the no-match path; it now dedupes with a
		// Set, by identity.
		test('dedupes by identity when no match is given', function (assert) {
			let a = { name: 'a' };
			let b = { name: 'b' };

			assert.deepEqual(
				searchBy(['name', undefined, [a, a, b]], {}),
				[a, b],
				'the repeated reference was deduped',
			);
		});
	});

	module('sort-by', function () {
		test('sorts by multiple keys, falling through to the next on a tie', function (assert) {
			let rows = [
				{ a: 1, b: 2 },
				{ a: 0, b: 9 },
				{ a: 1, b: 1 },
			];

			assert.deepEqual(
				sortBy(['a', 'b', rows], {}),
				[
					{ a: 0, b: 9 },
					{ a: 1, b: 1 },
					{ a: 1, b: 2 },
				],
				'sorted by a, then by b where a ties',
			);
		});
	});

	module('union', function () {
		test('dedupes the concatenated arrays by identity, using a Set', function (assert) {
			let a = { id: 1 };
			let b = { id: 2 };

			assert.deepEqual(union([[a, b], [a]]), [a, b], 'a appears once');
		});
	});

	module('uniq-by', function () {
		test('keeps the first occurrence for each distinct key, via a Set', function (assert) {
			let first = { id: 1, tag: 'first' };
			let dup = { id: 1, tag: 'dup' };
			let other = { id: 2, tag: 'other' };

			assert.deepEqual(
				uniqBy(['id', [first, dup, other]]),
				[first, other],
				'the duplicate id was dropped, keeping the earlier item',
			);
		});
	});

	module('without', function () {
		test('a scalar needle removes every matching element', function (assert) {
			assert.deepEqual(
				without([2, [1, 2, 3, 2]]),
				[1, 3],
				'both 2s removed',
			);
		});

		test('an array needle removes every element it contains', function (assert) {
			assert.deepEqual(
				without([
					[2, 3],
					[1, 2, 3, 4],
				]),
				[1, 4],
				'anything in the needle array removed',
			);
		});
	});

	module('compact', function () {
		test('removes only null and undefined, keeping other falsy values', function (assert) {
			assert.deepEqual(
				compact([[1, null, 0, '', undefined, false, 2]]),
				[1, 0, '', false, 2],
				'0, empty string and false all survive',
			);
		});
	});
});
