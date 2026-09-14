import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Live queries feed `store.inject` / `store.remove`, so a change made by
// anyone else has to reach the cached record without a reload. HI-357 (an
// uploaded file that only appears after a manual refresh) is this path
// failing for a nested value.

scope('Integration | surreal | live queries', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	hooks.beforeEach(function () {
		this.subs = [];
		this.watch = async (table) => {
			let sub = await this.surreal.live(table);
			// Registration is asynchronous; without waiting for it a write
			// issued immediately afterwards can be missed entirely.
			if (typeof sub.ready === 'function') await sub.ready();
			this.subs.push(sub);
			return sub;
		};
	});

	hooks.afterEach(async function () {
		for (const sub of this.subs) {
			try {
				await this.surreal.kill(sub);
			} catch (e) {
				// ignore — the connection may already be gone
			}
		}
	});

	// ------------------------------------------------------------------
	// The basic actions
	// ------------------------------------------------------------------

	test('a CREATE elsewhere injects the new record into the cache', async function (assert) {
		await this.watch('gizmo');

		await this.surreal.query('CREATE gizmo:livecreate SET name = "Remote"');

		await until(() => this.store.cached('gizmo', 'gizmo:livecreate'), { timeout: 5000 });

		let cached = this.store.cached('gizmo', 'gizmo:livecreate');
		assert.ok(cached, 'the new record reached the cache');
		assert.strictEqual(cached.name, 'Remote', 'with its values');
	});

	test('an UPDATE elsewhere is applied to the cached record', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'liveupdate', { name: 'Before' });
		await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:liveupdate SET name = "After"');

		await until(() => gizmo.name === 'After', { timeout: 5000 });
		assert.strictEqual(gizmo.name, 'After', 'the cached record was updated in place');
	});

	test('a DELETE elsewhere removes the record from the cache', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'livedelete', { name: 'Doomed' });
		await this.watch('gizmo');

		await this.surreal.query('DELETE gizmo:livedelete');

		await until(() => !this.store.cached('gizmo', gizmo.id), { timeout: 5000 });
		assert.notOk(this.store.cached('gizmo', gizmo.id), 'the record left the cache');
		assert.false(gizmo.exists, 'and is marked as no longer existing');
	});

	// ------------------------------------------------------------------
	// Nested shapes
	// ------------------------------------------------------------------

	test('a live update to an embedded object is applied', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'liveobj', {
			name: 'G',
			spec: { code: 'BEFORE' },
		});
		await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:liveobj SET spec.code = "AFTER"');

		await until(() => gizmo.spec.code === 'AFTER', { timeout: 5000 });
		assert.strictEqual(gizmo.spec.code, 'AFTER', 'the nested object was updated live');
	});

	test('a live update to a doubly-nested embedded object is applied', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'liveobj2', {
			name: 'G',
			spec: { code: 'X', note: { text: 'BEFORE' } },
		});
		await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:liveobj2 SET spec.note.text = "AFTER"');

		await until(() => gizmo.spec.note.text === 'AFTER', { timeout: 5000 });
		assert.strictEqual(gizmo.spec.note.text, 'AFTER', 'the doubly-nested value was updated live');
	});

	test('a live append to an array of embedded objects is applied', async function (assert) {
		// HI-357's shape: a row added to a nested list by something other
		// than this client, which has to appear without a manual refresh.
		let gizmo = await this.store.create('gizmo', 'livearr', {
			name: 'G',
			specs: [{ code: 'AAA' }],
		});
		await this.watch('gizmo');

		await this.surreal.query(
			'UPDATE gizmo:livearr SET specs = [{ code: "AAA" }, { code: "ADDED" }]',
		);

		await until(() => gizmo.specs.length === 2, { timeout: 5000 });
		assert.strictEqual(gizmo.specs[1].code, 'ADDED', 'the appended element arrived live');
	});

	test('a live update inside an existing array element is applied', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'livearr2', {
			name: 'G',
			specs: [{ code: 'AAA', note: { text: 'BEFORE' } }],
		});
		await this.watch('gizmo');

		await this.surreal.query(
			'UPDATE gizmo:livearr2 SET specs = [{ code: "AAA", note: { text: "AFTER" } }]',
		);

		await until(() => gizmo.specs[0].note.text === 'AFTER', { timeout: 5000 });
		assert.strictEqual(gizmo.specs[0].note.text, 'AFTER', 'the nested change inside the element arrived live');
	});

	test('a live removal from an array of embedded objects is applied', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'livearr3', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});
		await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:livearr3 SET specs = [{ code: "BBB" }]');

		await until(() => gizmo.specs.length === 1, { timeout: 5000 });
		assert.strictEqual(gizmo.specs[0].code, 'BBB', 'the right element survived');
	});

	test('a live update to an array of record links is applied', async function (assert) {
		let a1 = await this.store.create('author', 'lv1', { name: 'A1' });
		await this.store.create('author', 'lv2', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'livelinks', { name: 'G', owners: [a1] });
		await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:livelinks SET owners = [author:lv1, author:lv2]');

		await until(() => gizmo.owners.length === 2, { timeout: 5000 });
		assert.deepEqual(
			[...gizmo.owners].map((o) => String(o.id)).sort(),
			['author:lv1', 'author:lv2'],
			'the added link arrived live',
		);
	});

	// ------------------------------------------------------------------
	// Interaction with local state
	// ------------------------------------------------------------------

	test('a live update does not discard an unsaved local edit to a different field', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'liveconflict', {
			name: 'Before',
			spec: { code: 'LOCAL' },
		});
		await autosaved(gizmo);
		await this.watch('gizmo');

		// Edit locally, then have the server change a different field while
		// that edit is still within its debounce window.
		gizmo.spec.code = 'TYPED';
		await this.surreal.query('UPDATE gizmo:liveconflict SET name = "Remote"');

		await until(() => gizmo.name === 'Remote', { timeout: 5000 });

		assert.strictEqual(gizmo.name, 'Remote', 'the remote change to the other field landed');
		assert.strictEqual(gizmo.spec.code, 'TYPED', 'the unsaved local edit was preserved');

		await autosaved(gizmo);

		let [rows] = await this.surreal.query('SELECT spec.code AS code FROM gizmo:liveconflict');
		assert.strictEqual(rows[0].code, 'TYPED', 'and was still saved afterwards');
	});

	test('killing a live query stops further updates', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'livekill', { name: 'Before' });
		let sub = await this.watch('gizmo');

		await this.surreal.query('UPDATE gizmo:livekill SET name = "First"');
		await until(() => gizmo.name === 'First', { timeout: 5000 });

		await this.surreal.kill(sub);
		this.subs = this.subs.filter((s) => s !== sub);

		await this.surreal.query('UPDATE gizmo:livekill SET name = "Second"');
		await new Promise((resolve) => setTimeout(resolve, 500));

		assert.strictEqual(gizmo.name, 'First', 'no further updates arrived after the kill');
	});
});
