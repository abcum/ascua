import { module, test } from 'qunit';
import { setupRenderingTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// What the screen actually shows. Every "it saved but did not appear" report
// ends up here: the data is right in the model and the template never
// recomputed. A value that is correct the moment anything reads it again
// looks exactly like a rendering fault, which is why these assert on the DOM
// rather than on the record.

scope('Integration | component | reactivity', function (hooks) {
	setupRenderingTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	hooks.beforeEach(function () {
		this.store = this.owner.lookup('service:store');
		this.surreal = this.owner.lookup('service:surreal');
		this.subs = [];
	});

	hooks.afterEach(async function () {
		for (const sub of this.subs) {
			try {
				await this.surreal.kill(sub);
			} catch (e) {
				// ignore
			}
		}
	});

	const text = (el, selector) => [...el.querySelectorAll(selector)].map((n) => n.textContent.trim());

	// ------------------------------------------------------------------
	// Local edits
	// ------------------------------------------------------------------

	test('a scalar change rerenders', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v1', { text: 'before' });

		await render(hbs`<span class="out">{{this.doodad.text}}</span>`);
		assert.dom('.out').hasText('before');

		this.doodad.text = 'after';
		await settled();

		assert.dom('.out').hasText('after', 'the DOM followed the model');
	});

	test('a change inside an embedded object rerenders', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v2', { bits: { text: 'before' } });

		await render(hbs`<span class="out">{{this.doodad.bits.text}}</span>`);
		assert.dom('.out').hasText('before');

		this.doodad.bits.text = 'after';
		await settled();

		assert.dom('.out').hasText('after', 'a nested value rerendered');
	});

	test('a change inside an array element rerenders', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v3', {
			bitses: [{ text: 'one' }, { text: 'two' }],
		});

		await render(hbs`
			{{#each this.doodad.bitses as |b|}}<span class="row">{{b.text}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), ['one', 'two']);

		this.doodad.bitses[0].text = 'ONE';
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['ONE', 'two'], 'the edited row rerendered');
	});

	test('pushing to an array renders a new row', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v4', { texts: ['a'] });

		await render(hbs`
			{{#each this.doodad.texts as |t|}}<span class="row">{{t}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), ['a']);

		this.doodad.texts.pushObject('b');
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['a', 'b'], 'the new element appeared');
	});

	test('removing from an array removes the row', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v5', { texts: ['a', 'b', 'c'] });

		await render(hbs`
			{{#each this.doodad.texts as |t|}}<span class="row">{{t}}</span>{{/each}}
		`);

		this.doodad.texts.removeObject('b');
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['a', 'c'], 'the row disappeared');
	});

	test('an array length rerenders', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v6', { texts: ['a'] });

		await render(hbs`<span class="out">{{this.doodad.texts.length}}</span>`);
		assert.dom('.out').hasText('1');

		this.doodad.texts.pushObject('b');
		await settled();

		assert.dom('.out').hasText('2', 'length is tracked');
	});

	// ------------------------------------------------------------------
	// Server-driven updates
	// ------------------------------------------------------------------

	test('a reload rerenders a changed scalar', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v7', { text: 'before' });

		await render(hbs`<span class="out">{{this.doodad.text}}</span>`);

		await this.surreal.query('UPDATE doodad:v7 SET text = "remote"');
		await this.store.select('doodad', this.doodad.id, { reload: true });
		await settled();

		assert.dom('.out').hasText('remote', 'the out-of-band change reached the screen');
	});

	test('a live update rerenders a nested array without a reload', async function (assert) {
		// The HI-357 shape: something else adds a row and it has to appear
		// without the user refreshing the app.
		this.doodad = await this.store.create('doodad', 'v8', { bitses: [{ text: 'one' }] });

		let sub = await this.surreal.live('doodad');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		await render(hbs`
			{{#each this.doodad.bitses as |b|}}<span class="row">{{b.text}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), ['one']);

		await this.surreal.query(
			'UPDATE doodad:v8 SET bitses = [{ text: "one" }, { text: "two" }]',
		);

		await until(() => this.doodad.bitses.length === 2, { timeout: 5000, label: 'the live update' });
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['one', 'two'], 'the new row appeared on its own');
	});

	test('a live update rerenders a value inside an existing array element', async function (assert) {
		this.doodad = await this.store.create('doodad', 'v9', { bitses: [{ text: 'before' }] });

		let sub = await this.surreal.live('doodad');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		await render(hbs`
			{{#each this.doodad.bitses as |b|}}<span class="row">{{b.text}}</span>{{/each}}
		`);

		await this.surreal.query('UPDATE doodad:v9 SET bitses = [{ text: "after" }]');

		await until(() => this.doodad.bitses[0].text === 'after', { timeout: 5000, label: 'the live update' });
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['after'], 'the existing row rerendered in place');
	});

	// ------------------------------------------------------------------
	// Links resolving after the first render
	// ------------------------------------------------------------------

	test('a link renders once the record behind it resolves', async function (assert) {
		await this.store.create('author', 'w1', { name: 'Resolved' });
		await this.store.create('doodad', 'v10', { text: 'x' });
		await this.surreal.query('UPDATE doodad:v10 SET link = author:w1');

		this.store.reset();

		this.doodad = await this.store.select('doodad', 'doodad:v10', { reload: true });

		await render(hbs`<span class="out">{{this.doodad.link.name}}</span>`);

		await until(() => this.element.querySelector('.out').textContent.trim() === 'Resolved', {
			timeout: 5000,
			label: 'the link to render',
		});

		assert.dom('.out').hasText('Resolved', 'the link rendered once it resolved, with no second render forced');
	});

	test('a list filtered by a value behind a link renders once the links resolve', async function (assert) {
		// The HI-358 shape: a list of record links filtered on a property of
		// the linked record. Before they resolve every link reads as
		// undefined, so the filter matches nothing and the section renders
		// empty — and if that filter never recomputes, it stays empty and the
		// data looks lost.
		await this.store.create('author', 'w2', { name: 'keep' });
		await this.store.create('author', 'w3', { name: 'drop' });
		await this.store.create('doodad', 'v11', {});
		await this.surreal.query('UPDATE doodad:v11 SET links = [author:w2, author:w3]');

		this.store.reset();

		this.doodad = await this.store.select('doodad', 'doodad:v11', { reload: true });

		await render(hbs`
			{{#each (filter-by "name" "keep" this.doodad.links) as |a|}}
				<span class="row">{{a.name}}</span>
			{{/each}}
		`);

		await until(() => this.element.querySelectorAll('.row').length === 1, {
			timeout: 5000,
			label: 'the filtered list to render',
		});

		assert.deepEqual(text(this.element, '.row'), ['keep'], 'the filter recomputed once the links resolved');
	});

	test('a lookup by a value behind a link renders once it resolves', async function (assert) {
		await this.store.create('author', 'w4', { name: 'found' });
		await this.store.create('doodad', 'v12', {});
		await this.surreal.query('UPDATE doodad:v12 SET links = [author:w4]');

		this.store.reset();

		this.doodad = await this.store.select('doodad', 'doodad:v12', { reload: true });

		await render(hbs`
			{{#let (find-by "name" "found" this.doodad.links) as |a|}}
				<span class="out">{{if a a.name "missing"}}</span>
			{{/let}}
		`);

		await until(() => this.element.querySelector('.out').textContent.trim() === 'found', {
			timeout: 5000,
			label: 'the lookup to render',
		});

		assert.dom('.out').hasText('found', 'the lookup recomputed once the link resolved');
	});

	// ------------------------------------------------------------------
	// The identity cache, rendered directly
	// ------------------------------------------------------------------

	test('a record arriving later appears in a list rendered from the cache', async function (assert) {
		// Routes hand `store.cached(model)` straight to a template while a
		// fetch they did not await is still running, so the array has to
		// notify when a record lands in it.
		this.cache = this.store.cached('doodad');

		await render(hbs`
			{{#each this.cache as |d|}}<span class="row">{{d.text}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), [], 'nothing yet');

		await this.store.create('doodad', 'v13', { text: 'arrived' });
		await settled();

		assert.deepEqual(text(this.element, '.row'), ['arrived'], 'the record appeared without re-entering the route');
	});

	test('a record removed from the cache disappears from a rendered list', async function (assert) {
		let doodad = await this.store.create('doodad', 'v14', { text: 'here' });
		this.cache = this.store.cached('doodad');

		await render(hbs`
			{{#each this.cache as |d|}}<span class="row">{{d.text}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), ['here']);

		this.store.unload('doodad', doodad.id);
		await settled();

		assert.deepEqual(text(this.element, '.row'), [], 'the row disappeared');
	});

	test('a live create appears in a list rendered from the cache', async function (assert) {
		this.cache = this.store.cached('doodad');

		let sub = await this.surreal.live('doodad');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		await render(hbs`
			{{#each this.cache as |d|}}<span class="row">{{d.text}}</span>{{/each}}
		`);

		await this.surreal.query('CREATE doodad:v15 SET text = "pushed"');

		await until(() => this.element.querySelectorAll('.row').length === 1, {
			timeout: 5000,
			label: 'the live record to render',
		});

		assert.deepEqual(text(this.element, '.row'), ['pushed'], 'a record created elsewhere rendered itself');
	});

	test('a live delete removes the row from a rendered list', async function (assert) {
		await this.store.create('doodad', 'v16', { text: 'doomed' });
		this.cache = this.store.cached('doodad');

		let sub = await this.surreal.live('doodad');
		if (typeof sub.ready === 'function') await sub.ready();
		this.subs.push(sub);

		await render(hbs`
			{{#each this.cache as |d|}}<span class="row">{{d.text}}</span>{{/each}}
		`);
		assert.deepEqual(text(this.element, '.row'), ['doomed']);

		await this.surreal.query('DELETE doodad:v16');

		await until(() => this.element.querySelectorAll('.row').length === 0, {
			timeout: 5000,
			label: 'the row to disappear',
		});

		assert.deepEqual(text(this.element, '.row'), [], 'the deleted record left the screen');
	});

	// ------------------------------------------------------------------
	// Save round trips
	// ------------------------------------------------------------------

	test('a save does not flicker the rendered value', async function (assert) {
		// `ingest` reassigns every field from the server's copy, so a value
		// the user is looking at must not blink through an empty state.
		this.doodad = await this.store.create('doodad', 'v17', { text: 'typed' });

		await render(hbs`<span class="out">{{this.doodad.text}}</span>`);

		let seen = new Set();
		let observer = new MutationObserver(() => {
			seen.add(this.element.querySelector('.out').textContent.trim());
		});
		observer.observe(this.element, { childList: true, subtree: true, characterData: true });

		this.doodad.text = 'edited';
		await autosaved(this.doodad);
		await settled();
		observer.disconnect();

		assert.dom('.out').hasText('edited', 'ended on the right value');
		assert.notOk(seen.has(''), 'and never rendered empty on the way there');
	});
});
