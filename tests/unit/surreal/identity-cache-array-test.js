import { module, test } from 'qunit';
import { get } from '@ember/object';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import CacheArray from '@ascua/surreal/classes/array';

// `services/store.js`'s `#cache` is one of these per model - a plain
// identity-cache array handed straight out to a route's `model()` via
// `store.cached(model)` (no id). Its own top comment explains why its
// mutators have to notify: a record arriving after the initial render
// (addObject, from an un-awaited `remote()` fetch) has to invalidate
// whatever already read the array, the same way `store.js`'s own
// lookup()/lookupAll() depend on consuming '[]' before scanning (see the
// comment above those two functions).
//
// These tests consume the same tag, the same way, and cover both
// directions: a mutation that actually changes the array must notify, and
// one that doesn't (a redundant addObject, an empty removeObjects, clearing
// an already-empty array) must not. That "must not" is confirmed by
// counting cache recomputes rather than comparing final lengths, since a
// spurious notify and a real one land on the same length when nothing was
// actually added or removed.

module('Unit | surreal | identity-cache array', function () {
	function tracked(arr) {
		let calls = 0;
		let cache = createCache(() => {
			calls++;
			// eslint-disable-next-line ember/no-get
			get(arr, '[]');
			return arr.length;
		});
		return {
			read: () => getValue(cache),
			get calls() {
				return calls;
			},
		};
	}

	module('addObject', function () {
		test('adding a new value notifies', function (assert) {
			let arr = new CacheArray();
			let t = tracked(arr);

			assert.strictEqual(t.read(), 0, 'empty to start');

			arr.addObject('a');

			assert.strictEqual(t.read(), 1, 'the add is now visible');
		});

		test('adding an already-present value does not notify', function (assert) {
			let arr = new CacheArray();
			arr.addObject('a');

			let t = tracked(arr);
			assert.strictEqual(t.read(), 1, 'primed with one item');
			assert.strictEqual(t.calls, 1);

			arr.addObject('a');

			assert.strictEqual(t.read(), 1, 'still one item');
			assert.strictEqual(
				t.calls,
				1,
				'the no-op never dirtied the tag, so the cache did not recompute',
			);
		});
	});

	module('removeObjects', function () {
		test('removing a present value notifies', function (assert) {
			let arr = new CacheArray();
			arr.addObject('a');
			arr.addObject('b');

			let t = tracked(arr);
			assert.strictEqual(t.read(), 2, 'primed with two items');

			arr.removeObjects(['a']);

			assert.strictEqual(t.read(), 1, 'the removal is now visible');
		});

		test('removing values that are not present does not notify', function (assert) {
			let arr = new CacheArray();
			arr.addObject('a');

			let t = tracked(arr);
			assert.strictEqual(t.read(), 1, 'primed');
			assert.strictEqual(t.calls, 1);

			arr.removeObjects(['nope']);

			assert.strictEqual(t.read(), 1, 'unchanged');
			assert.strictEqual(
				t.calls,
				1,
				'nothing was removed, so nothing dirtied the tag',
			);
		});
	});

	module('clear', function () {
		test('clearing a non-empty array notifies', function (assert) {
			let arr = new CacheArray();
			arr.addObject('a');

			let t = tracked(arr);
			assert.strictEqual(t.read(), 1, 'primed');

			arr.clear();

			assert.strictEqual(t.read(), 0, 'the clear is now visible');
		});

		test('clearing an already-empty array does not notify', function (assert) {
			let arr = new CacheArray();
			let t = tracked(arr);

			assert.strictEqual(t.read(), 0, 'primed empty');
			assert.strictEqual(t.calls, 1);

			arr.clear();

			assert.strictEqual(t.read(), 0, 'still empty');
			assert.strictEqual(
				t.calls,
				1,
				'clearing an already-empty array did not dirty the tag',
			);
		});
	});
});
