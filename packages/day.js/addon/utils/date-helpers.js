// Shared implementations for the date helpers in this package.
//
// Each export is a factory which takes the already-imported `Date`
// constructor (dayjs) and returns the actual helper implementation, so
// that every helper file only differs in which date library it imports.

export function createDateAdd(Date) {
	return function ([ value = undefined, c = undefined, t = undefined ], options = undefined) {
		if (options) {
			return Date(value).add( Object.assign({}, options) );
		} else {
			return Date(value).add(c, t);
		}
	};
}

export function createDateCalendar(Date) {
	return function ([ value = undefined, reference = undefined ], { format = undefined }) {
		return Date(value).calendar(reference, format);
	};
}

export function createDateDiff(Date) {
	return function ([ value = undefined, reference = undefined ], { precision = undefined, fraction = false }) {
		return Date(value).diff(reference, precision, fraction);
	};
}

export function createDateFormat(Date) {
	return function ([ value = undefined, format = undefined ]) {
		return Date(value).format(format);
	};
}

export function createDateRelative(Date) {
	return function ([ value = undefined, reference = undefined ], { ignoreSuffix = false }) {
		return Date(value).from(reference, ignoreSuffix);
	};
}

export function createDateSub(Date) {
	return function ([ value = undefined, c = undefined, t = undefined ], options = undefined) {
		if (options) {
			return Date(value).subtract( Object.assign({}, options) );
		} else {
			return Date(value).subtract(c, t);
		}
	};
}

export function createDate(Date) {
	return function ([ value = undefined ]) {
		return Date(value);
	};
}

export function createNow(Date) {
	return function (clockNow) {
		return Date(clockNow);
	};
}

export function createUtc(Date) {
	return function ([ value = undefined ]) {
		return Date(value).utc();
	};
}
