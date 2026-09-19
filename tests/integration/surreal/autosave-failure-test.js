import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// A save that fails is rolled back and only reported through `console.error`
// (see decorators/autosave.js), so a record can silently revert while the UI
// still shows the value the user typed. `Model#error` is the only programmatic
// signal that happened — these tests assert on it directly.

scope('Integration | surreal | autosave failures', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	test('a nested-object autosave records no error', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'err1', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		gizmo.spec.code = 'BBB';
		await autosaved(gizmo);

		assert.strictEqual(
			gizmo.error && (gizmo.error.message || JSON.stringify(gizmo.error)),
			undefined,
			'no autosave failure was recorded',
		);
	});

	test('a create followed by an immediate nested edit records no error', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'err2', { name: 'G' });

		gizmo.spec.code = 'FIRST';
		await autosaved(gizmo);

		assert.strictEqual(
			gizmo.error && (gizmo.error.message || JSON.stringify(gizmo.error)),
			undefined,
			'no autosave failure was recorded',
		);
	});

	test('a plain scalar autosave records no error', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'err3', { name: 'G' });

		gizmo.name = 'H';
		await autosaved(gizmo);

		assert.strictEqual(
			gizmo.error && (gizmo.error.message || JSON.stringify(gizmo.error)),
			undefined,
			'no autosave failure was recorded',
		);
	});

	test('rollback on a record that has never been ingested does not throw', function (assert) {
		// `store.modify`'s failure path calls `rollback()`. A record with no
		// server-confirmed state has no shadow to roll back to, and reading
		// one threw a TypeError that replaced the server's own error.
		// Built through `lookup` rather than `store.create`, so it has never
		// been ingested and has no shadow. Deliberately a model without
		// `@autosave`, so constructing it does not also schedule a save that
		// would outlive this test.
		let author = this.store.lookup('author').create({ name: 'Local only' });

		author.rollback();

		assert.ok(true, 'rollback completed without throwing');
	});

	test('a record can still autosave after a rollback', async function (assert) {
		// The consequence of the throw above: `rollback()` left the record in
		// LOADING, and `@autosave` only fires while a record is LOADED — so a
		// single failed save silently disabled saving on that record for the
		// rest of the session.
		let gizmo = await this.store.create('gizmo', 'rb1', { name: 'Before' });

		gizmo.rollback();

		gizmo.name = 'After';
		await autosaved(gizmo);

		let [rows] = await this.surreal.query('SELECT name FROM gizmo:rb1');
		assert.strictEqual(rows[0].name, 'After', 'the record was still saveable after a rollback');
	});

	test('creating a record issues exactly one write and no stray patch', async function (assert) {
		// `store.create` builds a throwaway record just to turn the data into
		// a payload. As an ordinary record its field setters called
		// `autosave()`, scheduling a save of something with no id at all —
		// which resolves to a TABLE target rather than a record.
		let calls = [];
		for (const m of ['create', 'update']) {
			let original = this.surreal[m].bind(this.surreal);
			this.surreal[m] = function (...args) {
				calls.push(m);
				return original(...args);
			};
		}

		await this.store.create('gizmo', 'once', {
			name: 'G',
			spec: { code: 'AAA' },
			specs: [{ code: 'BBB' }],
		});

		await new Promise((resolve) => setTimeout(resolve, 900));

		assert.deepEqual(calls, ['create'], 'only the create itself reached the server');
	});

	test('reloading a record issues no writes at all', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'quiet', {
			name: 'G',
			spec: { code: 'AAA' },
			specs: [{ code: 'BBB' }],
		});
		await new Promise((resolve) => setTimeout(resolve, 900));

		let calls = [];
		for (const m of ['create', 'update', 'delete']) {
			let original = this.surreal[m].bind(this.surreal);
			this.surreal[m] = function (...args) {
				calls.push(m);
				return original(...args);
			};
		}

		await this.store.select('gizmo', gizmo.id, { reload: true });
		await new Promise((resolve) => setTimeout(resolve, 900));

		assert.deepEqual(calls, [], 'ingesting server state wrote nothing back');
	});

	test('injecting a record does not trigger a save of the shadow copy', async function (assert) {
		// `Model#ingest` builds a shadow record via `store.lookup(tb).create(data)`,
		// which runs every field setter and so fires `autosave()` on the shadow.
		// The shadow is not the cached record and must never reach the server.
		let gizmo = await this.store.create('gizmo', 'err4', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		await this.store.select('gizmo', gizmo.id, { reload: true });
		await autosaved(gizmo);

		assert.strictEqual(
			gizmo.error && (gizmo.error.message || JSON.stringify(gizmo.error)),
			undefined,
			'reloading a record recorded no save failure',
		);
	});
});
