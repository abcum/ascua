import { assert } from '@ember/debug';
import { expandProperties } from '@ember/object/computed';
import { addObserver } from '@ember/object/observers';

export default function(...paths) {

	assert(
		'The @observe decorator requires `dependentKey` parameters',
		paths.length > 0 && paths.every(v => typeof v === "string")
	);

	return function(target, key, desc) {

		assert(
			'The @observe decorator must be applied to a method',
			desc && typeof desc.value === 'function',
		);

		for (let path of paths) {
			expandProperties(path, prop => {
				// `sync: false` registers an async observer instead of a
				// sync one (Ember's deprecated default). Verified against a
				// real build either way: this only reliably fires when the
				// observed property is mutated via classic
				// `set(obj, prop, value)` - a plain `this[prop] = value`
				// assignment (the normal way state is mutated everywhere
				// else in this codebase, @tracked or not) never calls
				// notifyPropertyChange, so neither sync nor async observers
				// ever see it. @observe/@unobserve are only meaningful on
				// code that still mutates through set().
				addObserver(target, prop, null, key, false);
			});
		}

		return desc;

	}

}
