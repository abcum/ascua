import Model from '../model';
import { RECORD } from '../model';
import { LOADED } from '../model';
import { assert } from '@ember/debug';

export default function(target) {
	assert(
		'The @autosave decorator can only be applied to a Model',
		!target || (target && target.prototype instanceof Model),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @autosave decorator can only be applied to a Model',
			target && target.prototype instanceof Model,
		);
		return func(target)
	};
}

function func(target) {

	target.prototype.autosave = function() {
		if (this[RECORD].state === LOADED) {

			// Called from a property setter (`classes/field/property.js`), a
			// synchronous context nothing can await, so this is the one place
			// a failure has to stop being a rejection. `save()` already records
			// it onto `this[RECORD].error` before rethrowing — see
			// `classes/model/index.js` — so nothing here is lost by not
			// re-throwing again; only reported, since an autosave failure that
			// only a `console.error` line describes is still better than one
			// nothing describes at all.

			return this.save().catch(e => {
				console.error('autosave: save failed, the record was rolled back to the last saved value', e);
			});

		}
	}

}
