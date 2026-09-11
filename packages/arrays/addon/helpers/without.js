import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';
import array from '../utils/array';

export function without([needle, haystack]) {
	if ( isArray(needle) ) {
		return array(haystack).reduce( (prev, item) => {
			return needle.includes(item) ? prev : prev.concat(item);
		}, []);
	} else {
		// `.without(value)` was Ember's Array prototype extension
		// (EXTEND_PROTOTYPES.Array), deprecated and removed in
		// ember-source 6.0 - every element not strictly equal to `value`.
		return array(haystack).filter(v => v !== needle);
	}
}

export default helper(without);
