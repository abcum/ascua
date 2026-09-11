import { helper } from '@ember/component/helper';
import array from '../utils/array';

// `.uniq()` was Ember's Array prototype extension (EXTEND_PROTOTYPES.Array),
// deprecated and removed in ember-source 6.0 - dedupes by identity, same as
// a Set.

export function union([...value]) {
	return [...new Set(array( [].concat.apply([], value) ))];
}

export default helper(union);
