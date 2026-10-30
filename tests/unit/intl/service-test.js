import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Intl | service', function (hooks) {

	setupTest(hooks);

	hooks.beforeEach(function () {
		this.intl = this.owner.lookup('service:intl');
		this.intl.add('en', { greeting: 'Hello {name}', count: '{n, plural, one {# task} other {# tasks}}', onlyEnglish: 'English only' });
		this.intl.add('de', { greeting: 'Hallo {name}', count: '{n, plural, one {# Aufgabe} other {# Aufgaben}}' });
	});

	test('translates in the active locale', async function (assert) {
		assert.strictEqual(this.intl.t('greeting', { name: 'Ada' }), 'Hello Ada');
		await this.intl.use('de');
		assert.strictEqual(this.intl.t('greeting', { name: 'Ada' }), 'Hallo Ada');
		assert.strictEqual(this.intl.t('count', { n: 2 }), '2 Aufgaben');
	});

	test('falls back to the default locale, then the key', async function (assert) {
		await this.intl.use('de');
		assert.strictEqual(this.intl.t('onlyEnglish'), 'English only');
		assert.strictEqual(this.intl.t('nowhere'), 'nowhere');
		assert.false(this.intl.has('nowhere'));
		assert.true(this.intl.has('onlyEnglish'));
	});

	test('the pseudo-locale wraps every message', async function (assert) {
		await this.intl.use('en-XA');
		assert.strictEqual(this.intl.t('greeting', { name: 'Ada' }), '⟦Hééllóó Ada⟧');
	});

	test('formats numbers, lists, names and sorting for the locale', async function (assert) {
		await this.intl.use('de');
		assert.strictEqual(this.intl.number(1234.5), '1.234,5');
		assert.strictEqual(this.intl.list(['a', 'b', 'c']), 'a, b und c');
		assert.strictEqual(this.intl.name('JP'), 'Japan');
		assert.deepEqual(['z', 'ä', 'a'].sort((a, b) => this.intl.compare(a, b)), ['a', 'ä', 'z']);
	});

});
