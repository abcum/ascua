import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Arrays of embedded objects (`@array('spec')`), each element itself holding
// an array and a further embedded object — the shape behind
// app.hireinsight.io's `contact.fields`, `contact.emails`, `contact.phones`
// and `contact.weburls`.

scope('Integration | surreal | nested arrays', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'gizmo'] });

	// ------------------------------------------------------------------
	// Round-tripping
	// ------------------------------------------------------------------

	test('an array of embedded objects round-trips through create and reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arr1', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		assert.strictEqual(gizmo.specs.length, 2, 'both elements present locally');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 2, 'both elements survived the round-trip');
		assert.deepEqual(
			[...reloaded.specs].map((s) => s.code),
			['AAA', 'BBB'],
			'in order, with their values',
		);
	});

	test('an array nested inside an array element round-trips', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arr2', {
			name: 'G',
			specs: [{ code: 'AAA', tags: ['x', 'y'] }],
		});

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual([...reloaded.specs[0].tags], ['x', 'y'], 'the nested array survived');
	});

	test('an embedded object nested inside an array element round-trips', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arr3', {
			name: 'G',
			specs: [{ code: 'AAA', note: { text: 'hello' } }],
		});

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs[0].note.text, 'hello', 'the nested object survived');
	});

	// ------------------------------------------------------------------
	// Autosaving
	// ------------------------------------------------------------------

	test('mutating a field on an array element autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto1', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		gizmo.specs[0].code = 'CCC';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs[0].code, 'CCC', 'the changed element reached the server');
		assert.strictEqual(reloaded.specs[1].code, 'BBB', 'the untouched sibling was left alone');
	});

	test('mutating a doubly-nested field on an array element autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto2', {
			name: 'G',
			specs: [{ code: 'AAA', note: { text: 'before' } }],
		});

		gizmo.specs[0].note.text = 'after';
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs[0].note.text, 'after', 'the nested-object change reached the server');
	});

	test('pushing to an array inside an array element autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto3', {
			name: 'G',
			specs: [{ code: 'AAA', tags: ['x'] }],
		});

		gizmo.specs[0].tags.pushObject('y');
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.deepEqual([...reloaded.specs[0].tags], ['x', 'y'], 'the nested array push reached the server');
	});

	test('pushing a new element onto the array autosaves', async function (assert) {
		// The HI-358 / HI-354 shape: adding a brand new custom field or email
		// row to a contact that already has some.
		let gizmo = await this.store.create('gizmo', 'arrauto4', {
			name: 'G',
			specs: [{ code: 'AAA' }],
		});

		gizmo.specs.pushObject({ code: 'NEW' });
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 2, 'the new element reached the server');
		assert.strictEqual(reloaded.specs[1].code, 'NEW', 'with its value');
	});

	test('pushing the first-ever element onto an empty array autosaves', async function (assert) {
		// The same shape on a record that has no such array at all yet — the
		// contact with no custom fields who gets their first one.
		let gizmo = await this.store.create('gizmo', 'arrauto5', { name: 'G' });

		gizmo.specs.pushObject({ code: 'FIRST' });
		await autosaved(gizmo);

		assert.strictEqual(gizmo.specs.length, 1, 'present locally');

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 1, 'the first-ever element reached the server');
		assert.strictEqual(reloaded.specs[0].code, 'FIRST', 'with its value');
	});

	test('removing an element autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto6', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		gizmo.specs.removeAt(0);
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 1, 'the element was removed on the server');
		assert.strictEqual(reloaded.specs[0].code, 'BBB', 'the right one survived');
	});

	test('replacing the whole array by assignment autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto7', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		gizmo.specs = [{ code: 'XXX' }];
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 1, 'the array was replaced on the server');
		assert.strictEqual(reloaded.specs[0].code, 'XXX', 'with the new contents');
	});

	test('emptying the array autosaves', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrauto8', {
			name: 'G',
			specs: [{ code: 'AAA' }],
		});

		gizmo.specs.clear();
		await autosaved(gizmo);

		let reloaded = await this.store.select('gizmo', gizmo.id, { reload: true });
		assert.strictEqual(reloaded.specs.length, 0, 'the array was emptied on the server');
	});

	// ------------------------------------------------------------------
	// Identity and reactivity
	// ------------------------------------------------------------------

	test('array and element identity survive a save', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrident', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		let arrayBefore = gizmo.specs;
		let el0 = gizmo.specs[0];
		let el1 = gizmo.specs[1];

		gizmo.specs[0].code = 'CCC';
		await autosaved(gizmo);

		assert.strictEqual(gizmo.specs, arrayBefore, 'array reference preserved');
		assert.strictEqual(gizmo.specs[0], el0, 'changed element reference preserved');
		assert.strictEqual(gizmo.specs[1], el1, 'untouched element reference preserved');
	});

	test('every array element has its parent wired for autosave', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arrparent', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		assert.strictEqual(gizmo.specs[0].parent, gizmo, 'first element knows its parent');
		assert.strictEqual(gizmo.specs[1].parent, gizmo, 'second element knows its parent');

		gizmo.specs.pushObject({ code: 'CCC' });
		assert.strictEqual(gizmo.specs[2].parent, gizmo, 'a pushed element knows its parent too');
	});

	// ------------------------------------------------------------------
	// Ingest
	// ------------------------------------------------------------------

	test('a server-side append to the array is applied on reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arringest1', {
			name: 'G',
			specs: [{ code: 'AAA' }],
		});

		await this.surreal.query(
			'UPDATE gizmo:arringest1 SET specs = [{ code: "AAA" }, { code: "REMOTE" }]',
		);

		await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(gizmo.specs.length, 2, 'the appended element arrived locally');
		assert.strictEqual(gizmo.specs[1].code, 'REMOTE', 'with its value');
	});

	test('a server-side removal from the array is applied on reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arringest2', {
			name: 'G',
			specs: [{ code: 'AAA' }, { code: 'BBB' }],
		});

		await this.surreal.query('UPDATE gizmo:arringest2 SET specs = [{ code: "BBB" }]');

		await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(gizmo.specs.length, 1, 'the removed element is gone locally');
		assert.strictEqual(gizmo.specs[0].code, 'BBB', 'the survivor is the right one');
	});

	test('a server-side change to a nested value inside an element is applied on reload', async function (assert) {
		let gizmo = await this.store.create('gizmo', 'arringest3', {
			name: 'G',
			specs: [{ code: 'AAA', note: { text: 'before' } }],
		});

		await this.surreal.query(
			'UPDATE gizmo:arringest3 SET specs = [{ code: "AAA", note: { text: "after" } }]',
		);

		await this.store.select('gizmo', gizmo.id, { reload: true });

		assert.strictEqual(gizmo.specs[0].note.text, 'after', 'the nested change arrived locally');
	});
});
