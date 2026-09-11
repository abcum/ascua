import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { get } from '@ember/object';

// `.mapBy(key)` was Ember's Array prototype extension
// (EXTEND_PROTOTYPES.Array), deprecated and removed in ember-source 6.0 -
// `array.map(item => get(item, key))` is what it did internally.

export function mapBy([param, array]) {

	if ( isArray(param) ) {
		array = param;
		param = undefined;
	}

	if ( !isArray(array) ) {
		return [];
	}

	switch (true) {
	case typeof param === 'function':
		return array.map(param);
	case isEmpty(param):
		return array.map(v => v);
	default:
		return array.map(item => get(item, param));
	}

}

export default helper(mapBy);
