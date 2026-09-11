import { helper } from '@ember/component/helper';
import { isEmpty } from '@ember/utils';
import { isArray } from '@ember/array';
import { typeOf } from '@ember/utils';
import { compare } from '@ember/utils';
import { get } from '@ember/object';
import array from '../utils/array';

export function sortBy([...params], { locale = false, numeric = false, caseFirst = 'false', sensitivity = 'base', ignorePunctuation = false }) {

	let props = params.slice(0, -1);
	let value = params.slice().pop();

	if ( isArray(props[0]) || typeOf(props[0]) === 'function') {
		props = props[0];
	}

	if ( isEmpty(props) ) {
		return [];
	}

	if ( !isArray(value) ) {
		return [];
	}

	if ( typeOf(props) === 'function' ) {
		return array(value).sort(props);
	}

	if ( locale === false ) {

		// `.sortBy(...properties)` was Ember's Array prototype extension
		// (EXTEND_PROTOTYPES.Array), deprecated and removed in
		// ember-source 6.0 - a multi-key sort comparing each property in
		// turn with `compare()` (an `@ember/utils` export, not a prototype
		// extension, so unaffected either way) and stopping at the first
		// one that differs, same as that extension did internally.

		return array(value).sort((one, two) => {
			for (const prop of props) {
				let c = compare(get(one, prop), get(two, prop));
				if (c !== 0) return c;
			}
			return 0;
		});

	}

	return array(value).sort(function(one, two) {

		for (let i=0; i<props.length; i++) {

			let [prop, dir] = String(props[i]).split(':');

			let a = String( get(one, prop) );
			let b = String( get(two, prop) );

			let comps = a.localeCompare(b, undefined, {
				numeric,
				caseFirst,
				sensitivity,
				ignorePunctuation,
			});

			if (comps !== 0) {
				return (dir === 'desc') ? (-1 * comps) : comps;
			} else {
				continue;
			}

		}

	});

}

export default helper(sortBy);
