import { helper } from '@ember/component/helper';
import { isArray } from '@ember/array';

export function objectAt([index, array]) {

	if ( !isArray(array) ) {
		return undefined;
	}

	// A custom array class (@ascua/bigdata's Sparse, @ascua/surreal's
	// RecordArray) defines `objectAt` itself — not through Ember's Array
	// prototype extensions — so it is used when present. A plain array only
	// ever had it via `EXTEND_PROTOTYPES.Array`, deprecated and removed in
	// ember-source 6.0, so it falls back to plain indexing instead.

	if (typeof array.objectAt === 'function') {
		return array.objectAt(index);
	}

	return array[index];

}

export default helper(objectAt);
