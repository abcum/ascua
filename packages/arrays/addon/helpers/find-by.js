import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.findBy(key)`/`.findBy(key, value)` were Ember's Array prototype
// extensions (EXTEND_PROTOTYPES.Array), deprecated and removed in
// ember-source 6.0 - see filter-by.js for the truthy-vs-equality split.

export function findBy([param, value, array]) {

	if ( !isArray(array) && isArray(value) ) {
		array = value;
		value = undefined;
	}

	if ( isEmpty(param) ) {
		return undefined;
	}

	if ( !isArray(array) ) {
		return undefined;
	}

	switch (true) {
	case typeof param === 'function':
		return array.find(param);
	case value === undefined:
		return array.find(item => Boolean(get(item, param)));
	default:
		return array.find(item => get(item, param) === value);
	}

}

export default helper(findBy);
