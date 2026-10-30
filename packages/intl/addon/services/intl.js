import Service from '@ember/service';
import { getOwner } from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { chain, normalise, PSEUDO } from '../utils/locale';
import { format, formatNumber, formatDate, formatter } from '../utils/message';

export default class extends Service {

	@tracked locale = 'en';

	@tracked catalogues = {};

	fallback = 'en';

	path = '/translations';

	#missing = new Set();

	constructor() {
		super(...arguments);
		let config = getOwner(this).resolveRegistration('config:environment')?.intl;
		this.fallback = config?.fallback ?? this.fallback;
		this.path = config?.path ?? this.path;
		this.locale = config?.locale ?? this.locale;
	}

	// Registers the messages for a locale, replacing the object so templates recompute.
	add(locale, messages) {
		this.catalogues = { ...this.catalogues, [normalise(locale)]: messages };
	}

	async load(locale) {
		for (let name of chain(locale, this.fallback)) {
			if (name === PSEUDO || this.catalogues[name]) continue;
			let response = await fetch(`${this.path}/${name}.json`);
			if (response.ok) {
				this.add(name, await response.json());
			}
		}
	}

	// Loads every catalogue in the fallback chain before switching, so nothing renders half-translated.
	async use(locale) {
		locale = normalise(locale);
		await this.load(locale);
		document.documentElement.lang = locale === PSEUDO ? 'en' : locale;
		this.locale = locale;
	}

	has(key) {
		return chain(this.locale, this.fallback).some(name => key in (this.catalogues[name] || {}));
	}

	t(key, values) {
		for (let name of chain(this.locale, this.fallback)) {
			let message = this.catalogues[name]?.[key];
			if (message === undefined) continue;
			try {
				let text = format(message, values, this.locale);
				return this.locale === PSEUDO ? `⟦${text}⟧` : text;
			} catch (error) {
				console.error(`[intl] ${key}: ${error.message}`);
				return key;
			}
		}
		this.#report(key);
		return key;
	}

	number(value, options) {
		return formatNumber(Number(value), this.locale, options);
	}

	date(value, options = { dateStyle: 'medium' }) {
		return formatDate(value, this.locale, options);
	}

	relative(value, unit, options = { numeric: 'auto' }) {
		return formatter(Intl.RelativeTimeFormat, this.locale, options).format(value, unit);
	}

	list(values, options = { type: 'conjunction' }) {
		return formatter(Intl.ListFormat, this.locale, options).format(values);
	}

	name(code, type = 'region') {
		return formatter(Intl.DisplayNames, this.locale, { type }).of(code);
	}

	compare(a, b, options) {
		return formatter(Intl.Collator, this.locale, options).compare(a, b);
	}

	#report(key) {
		if (!this.#missing.has(key)) {
			this.#missing.add(key);
			console.warn(`[intl] Missing translation "${key}" for ${this.locale}`);
		}
	}

}
