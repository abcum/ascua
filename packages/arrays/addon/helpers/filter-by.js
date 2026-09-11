import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.filterBy(key)`/`.filterBy(key, value)` were Ember's Array prototype
// extensions (EXTEND_PROTOTYPES.Array), deprecated and removed in
// ember-source 6.0 - a truthy check on `get(item, key)` with one argument,
// a strict-equality check with two, matching what those did.

export function filterBy([param, value, array]) {

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
		return array.filter(param);
	case value === undefined:
		return array.filter(item => Boolean(get(item, param)));
	default:
		return array.filter(item => get(item, param) === value);
	}

}

export default helper(filterBy);
