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

				// Logged with the record it happened to and the server's own
				// message. `console.error('...', e)` alone rendered as
				// `[object Object]` in a test log or a bug report - a
				// SurrealDB SDK error is not an Error subclass in every case,
				// so neither the record nor the reason survived, and an
				// autosave that silently reverted a user's typing looked
				// identical to one that never ran.

				let reason = (e && (e.message || e.description)) || String(e);

				console.error(
					`autosave: save of ${this.id || '<unsaved record>'} failed, the record was rolled back ` +
					`to the last saved value: ${reason}`,
					e,
				);

			});

		}
	}

}
