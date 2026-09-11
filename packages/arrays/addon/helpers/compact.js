import { helper } from '@ember/component/helper';
import array from '../utils/array';

// `.compact()` was Ember's Array prototype extension
// (EXTEND_PROTOTYPES.Array), deprecated and removed in ember-source 6.0 -
// it removed only null/undefined, not every falsy value.

export function compact([value]) {
	return array(value).filter(v => v !== null && v !== undefined);
}

export default helper(compact);
