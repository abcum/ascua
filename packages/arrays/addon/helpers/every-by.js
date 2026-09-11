import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.every(fn)` is native, unaffected either way. `.isEvery(key[, value])`
// was Ember's Array prototype extension (EXTEND_PROTOTYPES.Array),
// deprecated and removed in ember-source 6.0 - a truthy-vs-equality check
// same as filterBy/isAny.

export function everyBy([thing, value, array]) {

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
		return array.every(thing);
	case value === undefined:
		return array.every(item => Boolean(get(item, thing)));
	default:
		return array.every(item => get(item, thing) === value);
	}

}

export default helper(everyBy);
