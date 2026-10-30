import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dateFormat from '@ascua/day.js/helpers/date-format';
import dateRelative from '@ascua/day.js/helpers/date-relative';

module('Integration | Intl | helpers', function (hooks) {

	setupRenderingTest(hooks);

	hooks.beforeEach(function () {
		// @ascua/moment.js defines the same helper names, so register the dayjs ones explicitly.
		this.owner.register('helper:date-format', dateFormat);
		this.owner.register('helper:date-relative', dateRelative);
		this.intl = this.owner.lookup('service:intl');
		this.intl.add('en', { tasks: '{n, plural, one {# task} other {# tasks}}' });
		this.intl.add('de', { tasks: '{n, plural, one {# Aufgabe} other {# Aufgaben}}' });
		this.set('when', new Date(2026, 9, 30, 15, 30));
	});

	hooks.afterEach(async function () {
		await this.intl.use('en');
	});

	test('t, number, money and percent follow the locale and update on a switch', async function (assert) {
		await render(hbs`<p>{{t "tasks" n=2}}|{{number 1234.5}}|{{money 1234 currency="EUR"}}|{{percent 0.25}}</p>`);
		assert.dom('p').hasText('2 tasks|1,234.5|€1,234|25%');
		await this.intl.use('de');
		await settled();
		assert.dom('p').hasText('2 Aufgaben|1.234,5|1.234\u00a0€|25\u00a0%');
	});

	test('date helpers use the dayjs locale for the active language', async function (assert) {
		await render(hbs`<p>{{date-format this.when "LL"}}</p>`);
		assert.dom('p').hasText('30 October 2026', 'English keeps the British default');
		await this.intl.use('de');
		await settled();
		assert.dom('p').hasText('30. Oktober 2026');
		await this.intl.use('ja');
		await settled();
		assert.dom('p').hasText('2026年10月30日');
		await this.intl.use('fr-CA');
		await settled();
		assert.dom('p').hasText('30 octobre 2026', 'regions fall back to the bundled language');
	});

	test('relative and calendar text are translated', async function (assert) {
		this.set('past', new Date(Date.now() - 3 * 24 * 3600 * 1000));
		await this.intl.use('de');
		await render(hbs`<p>{{date-relative this.past}}</p>`);
		assert.dom('p').hasText('vor 3 Tagen');
	});

	test('country names switch to the browser region names outside English', async function (assert) {
		await render(hbs`<p>{{country "DE"}}</p>`);
		assert.dom('p').hasText('Germany');
		await this.intl.use('de');
		await settled();
		assert.dom('p').hasText('Deutschland');
	});

});
