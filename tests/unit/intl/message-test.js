import { module, test } from 'qunit';
import { format, parse } from '@ascua/intl/utils/message';
import { chain, negotiate, normalise, pseudo } from '@ascua/intl/utils/locale';

module('Unit | Intl | message', function () {

	test('plain text and arguments', function (assert) {
		assert.strictEqual(format('Hello', {}, 'en'), 'Hello');
		assert.strictEqual(format('Hello {name}!', { name: 'Ada' }, 'en'), 'Hello Ada!');
		assert.strictEqual(format('Hello {name}!', {}, 'en'), 'Hello {name}!', 'a missing value stays visible');
	});

	test('numbers follow the locale', function (assert) {
		assert.strictEqual(format('{n}', { n: 1234.5 }, 'en'), '1,234.5');
		assert.strictEqual(format('{n}', { n: 1234.5 }, 'de'), '1.234,5');
		assert.strictEqual(format('{n, number, percent}', { n: 0.25 }, 'en'), '25%');
		assert.strictEqual(format('{n, number, integer}', { n: 2.7 }, 'en'), '3');
	});

	test('dates follow the locale', function (assert) {
		let when = new Date(2026, 9, 30);
		assert.strictEqual(format('{when, date, long}', { when }, 'en'), 'October 30, 2026');
		assert.strictEqual(format('{when, date, long}', { when }, 'de'), '30. Oktober 2026');
		assert.strictEqual(format('{when, date, long}', { when }, 'ja'), '2026年10月30日');
	});

	test('plurals use the locale rules and exact matches', function (assert) {
		let source = '{n, plural, =0 {No contacts} one {# contact} other {# contacts}}';
		assert.strictEqual(format(source, { n: 0 }, 'en'), 'No contacts');
		assert.strictEqual(format(source, { n: 1 }, 'en'), '1 contact');
		assert.strictEqual(format(source, { n: 1500 }, 'en'), '1,500 contacts');
		let french = '{n, plural, one {# contact} many {# de contacts} other {# contacts}}';
		assert.strictEqual(format(french, { n: 0 }, 'fr'), '0 contact', 'French treats zero as singular');
		assert.strictEqual(format(french, { n: 1000000 }, 'fr').replace(/\s/g, ' '), '1 000 000 de contacts', 'and uses "many" for millions');
		assert.strictEqual(format('{n, plural, other {# 件}}', { n: 3 }, 'ja'), '3 件', 'Japanese only has "other"');
	});

	test('select picks an option or falls back to other', function (assert) {
		let source = '{kind, select, call {Phone call} email {Email} other {Task}}';
		assert.strictEqual(format(source, { kind: 'call' }, 'en'), 'Phone call');
		assert.strictEqual(format(source, { kind: 'visit' }, 'en'), 'Task');
	});

	test('arguments nest inside options', function (assert) {
		let source = '{n, plural, one {{name} has # task} other {{name} has # tasks}}';
		assert.strictEqual(format(source, { n: 2, name: 'Ada' }, 'en'), 'Ada has 2 tasks');
	});

	test('escapes insert literal characters', function (assert) {
		assert.strictEqual(format('Use \\{braces\\} and \\\\', {}, 'en'), 'Use {braces} and \\');
		assert.strictEqual(format('{n, plural, other {\\# is #}}', { n: 5 }, 'en'), '# is 5');
	});

	test('invalid messages throw', function (assert) {
		assert.throws(() => parse('Hello {name'), SyntaxError);
		assert.throws(() => parse('{n, plural, one {x}}'), /other/);
		assert.throws(() => parse('oops }'), SyntaxError);
		assert.throws(() => parse('{n, bogus}'), /Unknown type/);
	});

	test('the pseudo-locale accents text but not values', function (assert) {
		assert.strictEqual(format('Hello {name}', { name: 'Ada' }, 'en-XA'), 'Hééllóó Ada');
		assert.strictEqual(pseudo('Contacts'), 'Cóóntáácts');
	});

});

module('Unit | Intl | locale', function () {

	test('normalise tidies the case and separator', function (assert) {
		assert.strictEqual(normalise('pt_pt'), 'pt-PT');
		assert.strictEqual(normalise('JA'), 'ja');
		assert.strictEqual(normalise('zh-hant-tw'), 'zh-Hant-TW');
	});

	test('chain runs from specific to fallback', function (assert) {
		assert.deepEqual(chain('es-ES'), ['es-ES', 'es', 'en']);
		assert.deepEqual(chain('en'), ['en']);
		assert.deepEqual(chain('de', null), ['de']);
	});

	test('negotiate picks the best supported locale', function (assert) {
		let supported = ['en', 'de', 'fr', 'es-ES', 'pt-PT', 'ja'];
		assert.strictEqual(negotiate(['fr-CA', 'en'], supported), 'fr');
		assert.strictEqual(negotiate(['es-MX'], supported), 'es-ES');
		assert.strictEqual(negotiate(['pt-BR'], supported), 'pt-PT');
		assert.strictEqual(negotiate(['it', 'ja-JP'], supported), 'ja');
		assert.strictEqual(negotiate(['it'], supported), 'en');
	});

});
