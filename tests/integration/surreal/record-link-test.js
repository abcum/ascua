import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Record links (`@record('author')`) and arrays of record links
// (`@array('author')`) under `@autosave` — the shape behind
// app.hireinsight.io's `contact.account`, `contact.owners` and
// `contact.applications` (HI-353: a LinkedIn import that sets the link but
// never persists it).

scope('Integration | surreal | record links', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	// ------------------------------------------------------------------
	// Single record links
	// ------------------------------------------------------------------

	test('setting a record link to a Model autosaves', async function (assert) {
		let author = await this.store.create('author', 'ra1', { name: 'A' });
		let gizmo = await this.store.create('gizmo', 'rl1', { name: 'G' });

		gizmo.owner = author;
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(String(reloaded.owner.id), 'author:ra1', 'the link reached the server');
	});

	test('setting a record link to a native RecordId autosaves', async function (assert) {
		await this.store.create('author', 'ra2', { name: 'A' });
		let gizmo = await this.store.create('gizmo', 'rl2', { name: 'G' });

		gizmo.owner = new RecordId('author', 'ra2');
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(String(reloaded.owner.id), 'author:ra2', 'the link reached the server');
	});

	test('changing an existing record link autosaves', async function (assert) {
		let a1 = await this.store.create('author', 'ra3', { name: 'A1' });
		let a2 = await this.store.create('author', 'ra4', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'rl3', { name: 'G', owner: a1 });

		gizmo.owner = a2;
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(String(reloaded.owner.id), 'author:ra4', 'the new link reached the server');
	});

	test('a record link resolves to the linked record through the proxy', async function (assert) {
		let author = await this.store.create('author', 'ra5', { name: 'Resolvable' });
		let gizmo = await this.store.create('gizmo', 'rl4', { name: 'G', owner: author });

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.owner.name, 'Resolvable', 'the linked record resolved through the proxy');
	});

	// ------------------------------------------------------------------
	// Arrays of record links
	// ------------------------------------------------------------------

	test('setting an array of record links autosaves', async function (assert) {
		let a1 = await this.store.create('author', 'rb1', { name: 'A1' });
		let a2 = await this.store.create('author', 'rb2', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'rl5', { name: 'G' });

		gizmo.owners = [a1, a2];
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual(
			[...reloaded.owners].map((o) => String(o.id)).sort(),
			['author:rb1', 'author:rb2'],
			'both links reached the server',
		);
	});

	test('pushing onto an empty array of record links autosaves', async function (assert) {
		// HI-353: the LinkedIn import adds the freshly-created contact to a
		// campaign by pushing onto an array of record links that is, for a
		// brand new contact, empty and not yet present on the server.
		let author = await this.store.create('author', 'rb3', { name: 'A' });
		let gizmo = await this.store.create('gizmo', 'rl6', { name: 'G' });

		gizmo.owners.pushObject(author);
		await autosaved(gizmo);

		assert.strictEqual(gizmo.owners.length, 1, 'present locally');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.owners.length, 1, 'the first-ever link reached the server');
		assert.strictEqual(String(reloaded.owners[0].id), 'author:rb3', 'with the right id');
	});

	test('pushing onto a populated array of record links autosaves', async function (assert) {
		let a1 = await this.store.create('author', 'rb4', { name: 'A1' });
		let a2 = await this.store.create('author', 'rb5', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'rl7', { name: 'G', owners: [a1] });

		gizmo.owners.pushObject(a2);
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.owners.length, 2, 'the added link reached the server');
	});

	test('pushing a native RecordId onto an array of record links autosaves', async function (assert) {
		await this.store.create('author', 'rb6', { name: 'A' });
		let gizmo = await this.store.create('gizmo', 'rl8', { name: 'G' });

		gizmo.owners.pushObject(new RecordId('author', 'rb6'));
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.owners.length, 1, 'the link reached the server');
		assert.strictEqual(String(reloaded.owners[0].id), 'author:rb6', 'with the right id');
	});

	test('removing from an array of record links autosaves', async function (assert) {
		let a1 = await this.store.create('author', 'rb7', { name: 'A1' });
		let a2 = await this.store.create('author', 'rb8', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'rl9', { name: 'G', owners: [a1, a2] });

		gizmo.owners.removeAt(0);
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.owners.length, 1, 'the link was removed on the server');
		assert.strictEqual(String(reloaded.owners[0].id), 'author:rb8', 'the right one survived');
	});

	test('an array of record links stays a list of links, not inlined objects', async function (assert) {
		let a1 = await this.store.create('author', 'rb9', { name: 'A1' });
		let gizmo = await this.store.create('gizmo', 'rl10', { name: 'G', owners: [a1] });

		await autosaved(gizmo);

		// Read the raw row, bypassing the connector entirely, so an
		// accidentally-inlined object (which a schemafull
		// `array<record<author>>` would reject) is visible.
		let [rows] = await this.surreal.query('SELECT owners FROM gizmo:rl10');
		assert.ok(rows[0].owners[0] instanceof RecordId, 'stored as a record link on the server');
	});

	test('record links resolve after a reload without being inlined', async function (assert) {
		let a1 = await this.store.create('author', 'rc1', { name: 'One' });
		let a2 = await this.store.create('author', 'rc2', { name: 'Two' });
		let gizmo = await this.store.create('gizmo', 'rl11', { name: 'G', owners: [a1, a2] });

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.deepEqual(
			[...reloaded.owners].map((o) => o.name).sort(),
			['One', 'Two'],
			'each link resolved to its record',
		);
	});

	// ------------------------------------------------------------------
	// Ingest
	// ------------------------------------------------------------------

	test('a server-side change to an array of record links is applied on reload', async function (assert) {
		let a1 = await this.store.create('author', 'rd1', { name: 'A1' });
		await this.store.create('author', 'rd2', { name: 'A2' });
		let gizmo = await this.store.create('gizmo', 'rl12', { name: 'G', owners: [a1] });

		await this.surreal.query('UPDATE gizmo:rl12 SET owners = [author:rd1, author:rd2]');

		await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(gizmo.owners.length, 2, 'the added link arrived locally');
		assert.deepEqual(
			[...gizmo.owners].map((o) => String(o.id)).sort(),
			['author:rd1', 'author:rd2'],
			'with the right ids',
		);
	});
});
