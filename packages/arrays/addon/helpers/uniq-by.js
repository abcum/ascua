import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.uniqBy(key)` was Ember's Array prototype extension
// (EXTEND_PROTOTYPES.Array), deprecated and removed in ember-source 6.0 -
// keeps the first item for each distinct `get(item, key)`, same as a Set
// keyed on that value did internally.

export function uniqBy([path, array]) {

	if ( isEmpty(path) ) {
		return [];
	}

	if ( !isArray(array) ) {
		return [];
	}

	let seen = new Set();

	return array.filter(item => {
		let key = get(item, path);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

}

export default helper(uniqBy);
