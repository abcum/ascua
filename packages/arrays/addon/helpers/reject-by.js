import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.reject(fn)`/`.rejectBy(key)`/`.rejectBy(key, value)` were Ember's Array
// prototype extensions (EXTEND_PROTOTYPES.Array), deprecated and removed in
// ember-source 6.0 - the inverse of filter/filterBy in each case.

export function rejectBy([param, value, array]) {

	if ( !isArray(array) && isArray(value) ) {
		array = value;
		value = undefined;
	}

	if ( isEmpty(param) ) {
		return [];
	}

	if ( !isArray(array) ) {
		return [];
	}

	switch (true) {
	case typeof param === 'function':
		return array.filter(item => !param(item));
	case value === undefined:
		return array.filter(item => !get(item, param));
	default:
		return array.filter(item => get(item, param) !== value);
	}

}

export default helper(rejectBy);
