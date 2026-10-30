import { chain } from '@ascua/intl/utils/locale';

// Shared implementations for the date helpers in this package.
//
// Each export is a factory which takes the already-imported `Date`
// constructor (dayjs) and returns the actual helper implementation, so
// that every helper file only differs in which date library it imports.

// Finds the bundled dayjs locale for an intl locale; plain English keeps the British default.
export function resolveLocale(Date, locale) {
	for (let name of chain(locale || 'en', null).map(name => name.toLowerCase())) {
		if (name !== 'en' && Date.Ls[name]) {
			return name;
		}
	}
}

function parse(Date, value, locale) {
	let date = Date(value);
	let name = resolveLocale(Date, locale);
	return name ? date.locale(name) : date;
}

export function createDateAdd(Date) {
	return function ([ value = undefined, c = undefined, t = undefined ], options = undefined, locale = undefined) {
		if (options) {
			return parse(Date, value, locale).add( Object.assign({}, options) );
		} else {
			return parse(Date, value, locale).add(c, t);
		}
	};
}

export function createDateCalendar(Date) {
	return function ([ value = undefined, reference = undefined ], { format = undefined }, locale = undefined) {
		return parse(Date, value, locale).calendar(reference, format);
	};
}

export function createDateDiff(Date) {
	return function ([ value = undefined, reference = undefined ], { precision = undefined, fraction = false }, locale = undefined) {
		return parse(Date, value, locale).diff(reference, precision, fraction);
	};
}

export function createDateFormat(Date) {
	return function ([ value = undefined, format = undefined ], hash = undefined, locale = undefined) {
		return parse(Date, value, locale).format(format);
	};
}

export function createDateRelative(Date) {
	return function ([ value = undefined, reference = undefined ], { ignoreSuffix = false }, locale = undefined) {
		return parse(Date, value, locale).from(reference, ignoreSuffix);
	};
}

export function createDateSub(Date) {
	return function ([ value = undefined, c = undefined, t = undefined ], options = undefined, locale = undefined) {
		if (options) {
			return parse(Date, value, locale).subtract( Object.assign({}, options) );
		} else {
			return parse(Date, value, locale).subtract(c, t);
		}
	};
}

export function createDate(Date) {
	return function ([ value = undefined ], hash = undefined, locale = undefined) {
		return parse(Date, value, locale);
	};
}

export function createNow(Date) {
	return function (clockNow, locale = undefined) {
		return parse(Date, clockNow, locale);
	};
}

export function createUtc(Date) {
	return function ([ value = undefined ], hash = undefined, locale = undefined) {
		return parse(Date, value, locale).utc();
	};
}
