import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Embedded objects (`@object('spec')`) — the shape behind
// app.hireinsight.io's `contact.location`, `contact.name`, `contact.image`
// and friends. Every assertion here reloads from the server with
// `{ reload: true }`, because the reported failures all look correct locally
// and only show up on a refresh.

scope('Integration | surreal | nested objects', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	// ------------------------------------------------------------------
	// Round-tripping
	// ------------------------------------------------------------------

	test('an embedded object round-trips through create and reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'obj1', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		assert.strictEqual(gizmo.spec.code, 'AAA', 'readable on the created record');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.code, 'AAA', 'survived the round-trip');
	});

	test('an embedded object nested inside an embedded object round-trips', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'obj2', {
			name: 'G',
			spec: { code: 'AAA', note: { text: 'hello' } },
		});

		assert.strictEqual(gizmo.spec.note.text, 'hello', 'readable two levels down');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.note.text, 'hello', 'survived the round-trip');
	});

	test('an array nested inside an embedded object round-trips', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'obj3', {
			name: 'G',
			spec: { code: 'AAA', tags: ['x', 'y'] },
		});

		assert.deepEqual([...gizmo.spec.tags], ['x', 'y'], 'readable on the created record');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual([...reloaded.spec.tags], ['x', 'y'], 'survived the round-trip');
	});

	// ------------------------------------------------------------------
	// Autosaving
	// ------------------------------------------------------------------

	test('setting a field on an embedded object autosaves the owning record', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto1', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		gizmo.spec.code = 'BBB';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.code, 'BBB', 'the nested change reached the server');
	});

	test('setting a field on a doubly-nested embedded object autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto2', {
			name: 'G',
			spec: { code: 'AAA', note: { text: 'before' } },
		});

		gizmo.spec.note.text = 'after';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.note.text, 'after', 'the two-level-deep change reached the server');
	});

	test('setting a field on an embedded object that did not exist on the server autosaves', async function (assert) {
		// The HI-354 shape: a contact with no `location` at all, where the
		// user types a city into the empty field for the first time. The
		// embedded object is materialised lazily by the getter, so there is
		// no server-side object for the patch to target.
		let gizmo = await this.store.create('gizmo', 'auto3', { name: 'G' });

		gizmo.spec.code = 'FIRST';
		await autosaved(gizmo);

		assert.strictEqual(gizmo.spec.code, 'FIRST', 'set locally');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.code, 'FIRST', 'the first-ever value for the embedded object was saved');
	});

	test('setting a doubly-nested field that did not exist on the server autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto4', { name: 'G' });

		gizmo.spec.note.text = 'FIRST';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.note.text, 'FIRST', 'the first-ever doubly-nested value was saved');
	});

	test('pushing to an array inside an embedded object autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto5', {
			name: 'G',
			spec: { code: 'AAA', tags: ['x'] },
		});

		gizmo.spec.tags.pushObject('y');
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual([...reloaded.spec.tags], ['x', 'y'], 'the nested array push reached the server');
	});

	test('pushing to an array inside an embedded object that did not exist autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto6', { name: 'G' });

		gizmo.spec.tags.pushObject('first');
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual([...reloaded.spec.tags], ['first'], 'the first-ever nested array value was saved');
	});

	test('replacing a whole embedded object by assignment autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto7', {
			name: 'G',
			spec: { code: 'AAA', note: { text: 'before' } },
		});

		gizmo.spec = { code: 'BBB', note: { text: 'after' } };
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.code, 'BBB', 'the replaced scalar reached the server');
		assert.strictEqual(reloaded.spec.note.text, 'after', 'the replaced nested object reached the server');
	});

	test('clearing a field on an embedded object autosaves the cleared value', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'auto8', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		gizmo.spec.code = '';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.spec.code ?? '', '', 'the cleared value reached the server');
	});

	// ------------------------------------------------------------------
	// Identity and reactivity
	// ------------------------------------------------------------------

	test('an embedded object keeps its identity across a save', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'ident1', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		let specBefore = gizmo.spec;
		let noteBefore = gizmo.spec.note;

		gizmo.spec.code = 'BBB';
		await autosaved(gizmo);

		assert.strictEqual(gizmo.spec, specBefore, 'embedded object reference preserved');
		assert.strictEqual(gizmo.spec.note, noteBefore, 'nested embedded object reference preserved');
	});

	test('an embedded object reached through the getter has its parent wired for autosave', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'parent1', { name: 'G' });

		assert.strictEqual(gizmo.spec.parent, gizmo, 'lazily-created embedded object knows its parent');
		assert.strictEqual(gizmo.spec.note.parent, gizmo.spec, 'doubly-nested embedded object knows its parent');
	});

	test('an embedded object assigned by the setter has its parent wired for autosave', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'parent2', {
			name: 'G',
			spec: { code: 'AAA', note: { text: 'n' } },
		});

		assert.strictEqual(gizmo.spec.parent, gizmo, 'assigned embedded object knows its parent');
		assert.strictEqual(gizmo.spec.note.parent, gizmo.spec, 'assigned nested embedded object knows its parent');
	});

	// ------------------------------------------------------------------
	// Ingest
	// ------------------------------------------------------------------

	test('a server update to an embedded object is applied on reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'ingest1', {
			name: 'G',
			spec: { code: 'AAA', note: { text: 'before' } },
		});

		// Change it out-of-band, as another client would
		await this.surreal.query('UPDATE gizmo:ingest1 SET spec.code = "ZZZ", spec.note.text = "later"');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(reloaded, gizmo, 'the same cached record instance was updated in place');
		assert.strictEqual(gizmo.spec.code, 'ZZZ', 'the out-of-band scalar change was ingested');
		assert.strictEqual(gizmo.spec.note.text, 'later', 'the out-of-band nested change was ingested');
	});

	test('ingesting a server update does not resurrect a field the server cleared', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'ingest2', {
			name: 'G',
			spec: { code: 'AAA' },
		});

		await this.surreal.query('UPDATE gizmo:ingest2 SET spec = {}');

		await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(gizmo.spec.code ?? '', '', 'the cleared nested field is gone locally too');
	});
});
