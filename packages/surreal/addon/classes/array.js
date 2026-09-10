// A plain per-model identity cache — `services/store.js`'s `#cache` is one of
// these per table. Not `@tracked`, not rendered directly, so none of the
// methods here need to notify anything; they only need to keep working
// without Ember's Array prototype extensions (`EXTEND_PROTOTYPES.Array`),
// which are deprecated and removed in ember-source 6.0.

export default class extends Array {

	// Add `value` if it is not already present — the identity-cache
	// semantics `store.js` needs when injecting a record that may already be
	// cached. Ember's `addObject` did this by checking `includes` first.

	addObject(value) {
		if (!this.includes(value)) this.push(value);
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
		for (const value of values) {
			let i = this.indexOf(value);
			if (i > -1) this.splice(i, 1);
		}
		return values;
	}

	// Kept for parity with the class this replaces — unused today, but no
	// reason to leave it broken (it called the same extensions) while every
	// other method here is being fixed.

	removeBy(key, value) {
		return this.remove(v => v && v[key] === value);
	}

	clear() {
		this.length = 0;
		return this;
	}

}
