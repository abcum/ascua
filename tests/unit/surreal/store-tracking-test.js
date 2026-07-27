import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { RecordId } from 'surrealdb';

// A record link resolves asynchronously: a getter asks the store for a record
// that has not arrived, gets undefined, and is expected to recompute once the
// record is injected. That only happens if the *miss* consumed the cache
// array's tracked tag.
//
// It regressed in the SurrealDB 3.x port. Record ids became native RecordIds,
// and since two RecordIds for the same record are never `===`, the lookups
// moved from Ember's `findBy('id', id)` to a plain
// `Array.prototype.find(v => String(v.id) === sid)`. `findBy` iterates with
// `objectAt` and consumes the array's tag; the native `find` consumes nothing.
// Comparison by string was the right change, losing the tag was not.
//
// The failure is invisible to any test that only reads values, because the
// value is correct the moment anything reads it again. It has to be asserted
// through a tracking cache, exactly as a template would consume it.

module('Unit | surreal | store tracking', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.store = this.owner.lookup('service:store');
	});

	test('a cache miss is invalidated when the record later arrives', function (assert) {
		let id = new RecordId('author', 'ada');

		let cache = createCache(() => this.store.cached('author', id));

		assert.strictEqual(getValue(cache), undefined, 'the record is not cached yet');

		this.store.inject({ id, name: 'Ada Lovelace' });

		let found = getValue(cache);

		assert.ok(found, 'the earlier miss recomputed once the record was injected');
		assert.strictEqual(found.name, 'Ada Lovelace', 'and it resolved to the injected record');
	});

	test('a miss is invalidated for an id given as a string', function (assert) {
		// Route params, query params and localStorage all hand back strings
		// rather than RecordIds, so the string form has to track too.

		let cache = createCache(() => this.store.cached('author', 'author:grace'));

		assert.strictEqual(getValue(cache), undefined, 'not cached yet');

		this.store.inject({ id: new RecordId('author', 'grace'), name: 'Grace Hopper' });

		assert.strictEqual(
			getValue(cache) && getValue(cache).name,
			'Grace Hopper',
			'a string id matches the injected RecordId and the miss recomputed',
		);
	});

	test('an array-of-ids miss is invalidated when one of them arrives', function (assert) {
		let ids = [new RecordId('author', 'alan'), new RecordId('author', 'anita')];

		let cache = createCache(() => this.store.cached('author', ids));

		assert.strictEqual(getValue(cache).length, 0, 'neither is cached yet');

		this.store.inject({ id: ids[0], name: 'Alan Turing' });

		assert.strictEqual(getValue(cache).length, 1, 'the miss recomputed when the first arrived');

		this.store.inject({ id: ids[1], name: 'Anita Borg' });

		assert.strictEqual(getValue(cache).length, 2, 'and again when the second arrived');
	});

	test('a hit stays valid until the record is unloaded', function (assert) {
		let id = new RecordId('author', 'barbara');

		this.store.inject({ id, name: 'Barbara Liskov' });

		let cache = createCache(() => this.store.cached('author', id));

		assert.strictEqual(getValue(cache).name, 'Barbara Liskov', 'found');

		this.store.unload('author', id);

		assert.strictEqual(getValue(cache), undefined, 'unloading invalidated the hit');
	});
});
