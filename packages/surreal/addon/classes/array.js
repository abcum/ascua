import { notifyPropertyChange } from '@ember/object';

// A plain per-model identity cache — `services/store.js`'s `#cache` is one of
// these per table, and `store.cached(model)` (no id) hands it straight out to
// a route's `model()`, in at least contacts/organisations/campaigns, so it
// *is* rendered directly, not just consulted internally. Its mutators must
// notify like Ember's Array prototype extensions did, or a record arriving
// after the initial render (the common case: `model()` fires a `remote()`
// fetch it does not await, then returns whatever is cached *now*) never
// appears without a full route re-entry re-running that `model()` against an
// by-then-warm cache. `store.js`'s `lookup`/`lookupAll` already depend on
// exactly this for the by-id case - "consuming '[]'" only does anything if a
// mutator on this class actually dirties it, which none of them did.

export default class extends Array {

	// Add `value` if it is not already present — the identity-cache
	// semantics `store.js` needs when injecting a record that may already be
	// cached. Ember's `addObject` did this by checking `includes` first.

	addObject(value) {
		if (!this.includes(value)) {
			this.push(value);
			notifyPropertyChange(this, '[]');
		}
		return value;
	}

	// Remove every element `callback` matches, and return them.

	remove(callback, target) {
		let arr = this.filter(callback, target);
		return this.removeObjects(arr);
	}

	// Remove every element in `values`, by identity. `values` is normally the
	// result of a prior `filter`, so this is a lookup-and-splice rather than
	// anything that needs to be efficient over a large, unrelated list.

	removeObjects(values) {
		let removed = false;
		for (const value of values) {
			let i = this.indexOf(value);
			if (i > -1) {
				this.splice(i, 1);
				removed = true;
			}
		}
		if (removed) notifyPropertyChange(this, '[]');
		return values;
	}

	// Kept for parity with the class this replaces — unused today, but no
	// reason to leave it broken (it called the same extensions) while every
	// other method here is being fixed.

	removeBy(key, value) {
		return this.remove(v => v && v[key] === value);
	}

	clear() {
		if (this.length > 0) {
			this.length = 0;
			notifyPropertyChange(this, '[]');
		}
		return this;
	}

}
