import { module, test } from 'qunit';
import { get } from '@ember/object';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import RecordArray from '@ascua/surreal/classes/types/array';

// Every model field array (contact.tags, contact.skills, model.questions,
// ...) is a RecordArray. This class's own comment used to claim the
// `create()` Proxy's `set` trap "notifies on the underlying index/length
// assignment these methods perform" - it never did; the trap only ever
// called `owner.autosave()`. In practice that was masked for an autosaving
// field: pushing onto the array triggers a save, and the re-ingest that
// follows reassigns the record's tracked `data` bag as a side effect - just
// on the save's debounce delay, and not for a field with no owner to
// autosave, or before that round-trip lands.
//
// diff-test.js's integration tests only ever check state after a save has
// completed, so they can't see this gap. These tests construct a
// RecordArray with no owner at all - nothing to autosave - and assert the
// Proxy's `set` trap notifies synchronously on a plain push/splice, before
// any save could possibly have run.

module('Unit | surreal | record array tracking', function () {
	function tracked(recordArray) {
		return createCache(() => {
			// eslint-disable-next-line ember/no-get
			get(recordArray, '[]');
			return recordArray.length;
		});
	}

	test('push notifies synchronously, with no owner attached', function (assert) {
		let arr = RecordArray.create(undefined, undefined, 'a');
		let cache = tracked(arr);

		assert.strictEqual(getValue(cache), 1, 'one item to start');

		arr.push('b');

		assert.strictEqual(
			getValue(cache),
			2,
			'the push invalidated the cache with no owner to autosave',
		);
	});

	test('splice notifies synchronously, with no owner attached', function (assert) {
		let arr = RecordArray.create(undefined, undefined, 'a', 'b', 'c');
		let cache = tracked(arr);

		assert.strictEqual(getValue(cache), 3, 'primed with three items');

		arr.splice(1, 1);

		assert.strictEqual(
			getValue(cache),
			2,
			'the splice invalidated the cache with no owner to autosave',
		);
	});
});
