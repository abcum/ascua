import { module, test } from 'qunit';
import { setupRenderingTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setComponentTemplate } from '@ember/component';
import Component from '@glimmer/component';

// Consuming apps render one component per array-of-Field element via
// {{#each}}, and some rely on that component instance surviving a save (e.g.
// to keep its own local @tracked state, such as an open popup). The
// SurrealDB PATCH-array-index workaround in classes/dmp/diff.js collapses an
// edit to an existing element into a whole-array `replace`, so these confirm
// {{#each}}'s list-diffing still keys on the element's own identity rather
// than tearing the component down - both for a plain save and for a save
// whose response is still in flight when a second edit lands.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | component | each identity after array replace', function (hooks) {
	setupRenderingTest(hooks);
	setupSurreal(hooks, { reset: ['book'] });

	test('a child rendered via {{#each}} over an array-of-Field is not torn down when a sibling element changes', async function (assert) {
		let destroyed = [];
		let inserted = [];

		class Probe extends Component {
			constructor() {
				super(...arguments);
				inserted.push(this.args.item);
			}
			willDestroy() {
				super.willDestroy();
				destroyed.push(this.args.item);
			}
		}
		setComponentTemplate(hbs`<span class="probe">{{@item.isbn}}</span>`, Probe);
		this.Probe = Probe;

		this.book = await this.owner.lookup('service:store').create('book', 'eachid', {
			title: 'T',
			details: [{ isbn: 'AAA', pages: 1 }, { isbn: 'BBB', pages: 2 }],
		});

		await render(hbs`
			{{#each this.book.details as |d|}}
				{{component this.Probe item=d}}
			{{/each}}
		`);

		assert.strictEqual(inserted.length, 2, 'both children mounted once up front');

		let el0Before = this.book.details[0];
		let el1Before = this.book.details[1];

		this.book.details[0].isbn = 'CCC';
		await this.book.save();
		await settled();

		assert.strictEqual(this.book.details[0], el0Before, 'changed element reference preserved after save');
		assert.strictEqual(this.book.details[1], el1Before, 'untouched sibling element reference preserved after save');
		assert.deepEqual(destroyed, [], 'no child component was torn down when an existing array element changed');
		assert.strictEqual(this.element.querySelectorAll('.probe').length, 2, 'both probes are still rendered');
		assert.strictEqual(this.element.querySelectorAll('.probe')[0].textContent.trim(), 'CCC', 'the changed child rerendered with the new value');
	});

	test('a stale in-flight save response does not replace the element being actively edited', async function (assert) {
		let destroyed = [];
		let inserted = [];

		class Probe extends Component {
			constructor() {
				super(...arguments);
				inserted.push(this.args.item);
			}
			willDestroy() {
				super.willDestroy();
				destroyed.push(this.args.item);
			}
		}
		setComponentTemplate(hbs`<span class="probe">{{@item.isbn}}</span>`, Probe);
		this.Probe = Probe;

		this.book = await this.owner.lookup('service:store').create('book', 'race1', {
			title: 'T',
			details: [{ isbn: 'V0', pages: 1 }, { isbn: 'BBB', pages: 2 }],
		});

		await render(hbs`
			{{#each this.book.details as |d|}}
				{{component this.Probe item=d}}
			{{/each}}
		`);

		let el0Before = this.book.details[0];

		// First edit - dispatch save() but do not await it yet, so its
		// response is still in flight when the second edit happens below.
		this.book.details[0].isbn = 'V1';
		let saving = this.book.save();

		// Simulate the user continuing to type before the first save's
		// (stale, echoing V1) response has come back and been ingested.
		this.book.details[0].isbn = 'V2';

		await saving;
		await settled();

		assert.strictEqual(this.book.details[0].isbn, 'V2', 'the later edit was not clobbered by the stale in-flight response');
		assert.strictEqual(this.book.details[0], el0Before, 'the element reference was not replaced by ingest of a stale response');
		assert.deepEqual(destroyed, [], 'the actively-edited child was not torn down by a stale save response');
	});
});
