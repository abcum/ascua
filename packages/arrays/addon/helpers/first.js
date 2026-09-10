import { helper } from '@ember/component/helper';
import array from '../utils/array';

// `array(value)` always returns a plain native array (see
// `../utils/array`), so this is a direct index — `.objectAt(0)` only ever
// worked here through Ember's Array prototype extensions, deprecated and
// removed in ember-source 6.0.

export function first([value]) {
	return array(value)[0];
}

export default helper(first);
