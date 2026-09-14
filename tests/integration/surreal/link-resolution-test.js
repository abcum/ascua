import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// A record link is a lazily-resolved proxy, so reading through one can happen
// before, during or after the record behind it arrives — and it can point at
// a record which does not exist at all. None of those may throw: a link that
// explodes when read takes down the whole render, not just the field.

scope('Integration | surreal | link resolution', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	test('a link resolves once the record it points at arrives', async function (assert) {
		await this.store.create('author', 'l1', { name: 'Arrives Later' });
		await this.store.create('doodad', 'k1', { link: new RecordId('author', 'l1') });

		// A fresh store has nothing cached, so the link starts unresolved.
		this.store.unload('author', 'author:l1');

		let doodad = await this.store.select('doodad', 'doodad:k1', { reload: true });

		await until(() => doodad.link.name === 'Arrives Later', {
			timeout: 5000,
			label: 'the link to resolve',
		});

		assert.strictEqual(doodad.link.name, 'Arrives Later', 'resolved through the proxy');
	});

	test('reading an unresolved link does not throw', async function (assert) {
		await this.store.create('author', 'l2', { name: 'Pending' });
		await this.store.create('doodad', 'k2', { link: new RecordId('author', 'l2') });
		this.store.unload('author', 'author:l2');

		let doodad = await this.store.select('doodad', 'doodad:k2', { reload: true });

		// Read immediately. Whether resolution has completed by now is a
		// race, so what matters is that reading is safe either way and that
		// the id is available without waiting for anything.
		let name;
		try {
			name = doodad.link.name;
		} catch (e) {
			name = '<threw>';
		}

		assert.notStrictEqual(name, '<threw>', 'reading through an unresolved link did not throw');
		assert.strictEqual(String(doodad.link), 'author:l2', 'and the id is available straight away');
	});

	test('a link to a record which does not exist does not throw', async function (assert) {
		// A dangling link is ordinary in practice — the record it points at
		// was deleted by someone else, or never existed.
		await this.store.create('doodad', 'k3', { link: new RecordId('author', 'missing') });

		let doodad = await this.store.select('doodad', 'doodad:k3', { reload: true });

		assert.strictEqual(String(doodad.link), 'author:missing', 'the id is still readable');

		await doodad.link.catch(() => {});

		assert.strictEqual(doodad.link.name, undefined, 'reading a field on it yields undefined rather than throwing');
	});

	test('an array of links tolerates a dangling element', async function (assert) {
		let real = await this.store.create('author', 'l4', { name: 'Real' });
		await this.store.create('doodad', 'k4', {
			links: [real, new RecordId('author', 'gone')],
		});

		let doodad = await this.store.select('doodad', 'doodad:k4', { reload: true });

		assert.strictEqual(doodad.links.length, 2, 'both links are present');

		let names = [...doodad.links].map((l) => {
			try {
				return l.name;
			} catch (e) {
				return '<threw>';
			}
		});

		assert.notOk(names.includes('<threw>'), 'reading through a dangling link did not throw');
	});

	test('a link to a deleted record keeps its id and stops resolving', async function (assert) {
		let author = await this.store.create('author', 'l5', { name: 'Doomed' });
		let doodad = await this.store.create('doodad', 'k5', { link: author });

		await author.delete();

		assert.strictEqual(String(doodad.link), 'author:l5', 'the link still names the record');

		let reloaded = await this.store.select('doodad', 'doodad:k5', { reload: true });
		assert.strictEqual(String(reloaded.link), 'author:l5', 'and survives a reload of the owner');
	});

	test('a link is the same proxy wherever it is reached from', async function (assert) {
		let author = await this.store.create('author', 'l6', { name: 'Shared' });
		let one = await this.store.create('doodad', 'k6a', { link: author });
		let two = await this.store.create('doodad', 'k6b', { link: author });

		assert.strictEqual(one.link, two.link, 'both records hold the same proxy instance');
	});

	test('a change made through a link saves the linked record, not the owner', async function (assert) {
		let author = await this.store.create('author', 'l7', { name: 'Before' });
		let doodad = await this.store.create('doodad', 'k7', { link: author, text: 'owner' });
		await autosaved(doodad);

		doodad.link.name = 'After';
		await doodad.link.save();

		let [authors] = await this.surreal.query('SELECT name FROM author:l7');
		assert.strictEqual(authors[0].name, 'After', 'the linked record was updated');

		let [doodads] = await this.surreal.query('SELECT text FROM doodad:k7');
		assert.strictEqual(doodads[0].text, 'owner', 'the owning record was left alone');
	});

	test('a link stringifies to an empty string when it has no id', async function (assert) {
		// Templates and URLs stringify links freely, so a missing id must not
		// render as the text "null" or "undefined".
		let doodad = await this.store.create('doodad', 'k8', {});

		assert.strictEqual(doodad.link, undefined, 'an unset link is undefined, not a proxy');
		assert.strictEqual(String(doodad.link ?? ''), '', 'and stringifies to nothing');
	});

	test('setting an array of links by string id stores real links', async function (assert) {
		await this.store.create('author', 'l10', { name: 'One' });
		await this.store.create('author', 'l11', { name: 'Two' });
		let doodad = await this.store.create('doodad', 'k10', {});

		doodad.links.pushObject('author:l10');
		doodad.links.pushObject('author:l11');
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT links FROM doodad:k10');
		assert.ok(rows[0].links[0] instanceof RecordId, 'stored as record links, not strings');
		assert.deepEqual(
			rows[0].links.map(String).sort(),
			['author:l10', 'author:l11'],
			'with the right ids',
		);
	});

	test('setting a link by a bare id pairs it with its table', async function (assert) {
		await this.store.create('author', 'l12', { name: 'Bare' });
		let doodad = await this.store.create('doodad', 'k11', {});

		doodad.link = 'l12';
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT link FROM doodad:k11');
		assert.strictEqual(String(rows[0].link), 'author:l12', 'the bare id was paired with the table');
	});

	test('setting a link by its string id resolves the same record', async function (assert) {
		await this.store.create('author', 'l9', { name: 'By String' });
		let doodad = await this.store.create('doodad', 'k9', {});

		doodad.link = 'author:l9';
		await autosaved(doodad);

		let [rows] = await this.surreal.query('SELECT link FROM doodad:k9');
		assert.strictEqual(String(rows[0].link), 'author:l9', 'stored as the right link');

		let reloaded = await this.store.select('doodad', 'doodad:k9', { reload: true });
		await until(() => reloaded.link.name === 'By String', { timeout: 5000, label: 'resolution' });
		assert.strictEqual(reloaded.link.name, 'By String', 'and resolves to the record');
	});
});
