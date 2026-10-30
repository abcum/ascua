import { PSEUDO, pseudo } from './locale';

// Messages use a small ICU subset: {name}, {n, number}, {when, date, long}, {n, plural, one {..} other {..}}, {x, select, ..}.
// Inside a plural option `#` is the formatted number, and `\{`, `\}`, `\#` and `\\` insert the literal character.

const parsed = new Map();
const formatters = new Map();

class Parser {

	constructor(source) {
		this.source = source;
		this.pos = 0;
	}

	fail(message) {
		throw new SyntaxError(`${message} at ${this.pos} in "${this.source}"`);
	}

	peek() {
		return this.source[this.pos];
	}

	read(until) {
		let start = this.pos;
		while (this.pos < this.source.length && !until.includes(this.peek())) {
			this.pos++;
		}
		return this.source.slice(start, this.pos).trim();
	}

	expect(char) {
		if (this.peek() !== char) {
			this.fail(`Expected "${char}"`);
		}
		this.pos++;
	}

	nodes(nested, plural) {
		let list = [];
		let text = '';
		while (this.pos < this.source.length) {
			let char = this.peek();
			if (char === '\\') {
				text += this.source[this.pos + 1] ?? '';
				this.pos += 2;
			} else if (char === '{') {
				text && list.push(text);
				text = '';
				list.push(this.argument());
			} else if (char === '}') {
				if (!nested) this.fail('Unexpected "}"');
				break;
			} else if (char === '#' && plural) {
				text && list.push(text);
				text = '';
				list.push({ hash: true });
				this.pos++;
			} else {
				text += char;
				this.pos++;
			}
		}
		text && list.push(text);
		return list;
	}

	argument() {
		this.expect('{');
		let name = this.read(',}');
		if (!name) this.fail('Missing argument name');
		if (this.peek() === '}') {
			this.pos++;
			return { name, type: 'plain' };
		}
		this.expect(',');
		let type = this.read(',}');
		if (type === 'plural' || type === 'select') {
			this.expect(',');
			let options = {};
			for (;;) {
				let selector = this.read('{}');
				if (this.peek() === '}') break;
				if (!selector) this.fail('Missing selector');
				this.expect('{');
				options[selector] = this.nodes(true, type === 'plural');
				this.expect('}');
			}
			this.expect('}');
			if (!options.other) this.fail('Missing "other" option');
			return { name, type, options };
		}
		if (!['number', 'date', 'time'].includes(type)) this.fail(`Unknown type "${type}"`);
		let style = undefined;
		if (this.peek() === ',') {
			this.pos++;
			style = this.read('}');
		}
		this.expect('}');
		return { name, type, style };
	}

}

export function parse(source) {
	let nodes = parsed.get(source);
	if (!nodes) {
		let parser = new Parser(source);
		nodes = parser.nodes(false, false);
		parsed.set(source, nodes);
	}
	return nodes;
}

// Intl constructors are slow, so every locale and options pair is built once.
export function formatter(Type, locale, options) {
	let key = `${Type.name}|${locale}|${JSON.stringify(options || {})}`;
	let found = formatters.get(key);
	if (!found) {
		found = new Type(locale === PSEUDO ? 'en' : locale, options);
		formatters.set(key, found);
	}
	return found;
}

export function formatNumber(value, locale, options) {
	return formatter(Intl.NumberFormat, locale, options).format(value);
}

export function formatDate(value, locale, options) {
	return formatter(Intl.DateTimeFormat, locale, options).format(new Date(value));
}

export function pluralise(value, locale, options) {
	return formatter(Intl.PluralRules, locale, options).select(value);
}

const NUMBER_STYLES = { integer: { maximumFractionDigits: 0 }, percent: { style: 'percent' } };

function run(nodes, values, locale, hash) {
	let out = '';
	for (let node of nodes) {
		if (typeof node === 'string') {
			out += locale === PSEUDO ? pseudo(node) : node;
			continue;
		}
		if (node.hash) {
			out += formatNumber(hash, locale);
			continue;
		}
		let value = values[node.name];
		if (value === undefined || value === null) {
			out += `{${node.name}}`;
			continue;
		}
		switch (node.type) {
		case 'plain':
			out += typeof value === 'number' ? formatNumber(value, locale) : String(value);
			break;
		case 'number':
			out += formatNumber(Number(value), locale, NUMBER_STYLES[node.style]);
			break;
		case 'date':
			out += formatDate(value, locale, { dateStyle: node.style || 'medium' });
			break;
		case 'time':
			out += formatDate(value, locale, { timeStyle: node.style || 'short' });
			break;
		case 'plural': {
			let count = Number(value);
			let option = node.options[`=${count}`] || node.options[pluralise(count, locale)] || node.options.other;
			out += run(option, values, locale, count);
			break;
		}
		case 'select':
			out += run(node.options[String(value)] || node.options.other, values, locale, hash);
			break;
		}
	}
	return out;
}

export function format(source, values = {}, locale = 'en') {
	return run(parse(source), values, locale, undefined);
}
