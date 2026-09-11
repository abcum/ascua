import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.any(fn)` (an alias for the native `.some()`) and `.isAny(key[, value])`
// were Ember's Array prototype extensions (EXTEND_PROTOTYPES.Array),
// deprecated and removed in ember-source 6.0 - `.some()` is native and needs
// no replacement, `.isAny` is a truthy-vs-equality check same as filterBy.

export function anyBy([thing, value, array]) {

	if ( !isArray(array) && isArray(value) ) {
		array = value;
		value = true;
	}

	if ( isEmpty(thing) ) {
		return false;
	}

	if ( !isArray(array) ) {
		return false;
	}

	switch (true) {
	case typeof thing === 'function':
		return array.some(thing);
	case value === undefined:
		return array.some(item => Boolean(get(item, thing)));
	default:
		return array.some(item => get(item, thing) === value);
	}

}

export default helper(anyBy);
