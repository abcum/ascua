import context from '@ascua/context';
import { tracked } from '@glimmer/tracking';
import { notifyPropertyChange } from '@ember/object';

// `notifyPropertyChange` is imported rather than called as a method, and
// rows are read by index rather than through `objectAt`. Both of those
// methods reach these classes only through Ember's Array prototype
// extensions — `EXTEND_PROTOTYPES.Array` — which are deprecated and go
// away in ember-source 6.0. The imported function is the same one the
// mixin delegates to, and the rows handed to `fulfillObjectsAt` are a
// plain array, so neither change alters behaviour today; they just stop
// the list depending on a host application's prototype configuration.

const FETCH = function() {
	return [];
};

export default class extends Array {

	limit = 0;

	fetch = 0;

	@tracked loaded = false;

	@tracked failure = undefined;

	constructor(limit, fetch = FETCH) {

		super();

		this.limit = limit;
		this.fetch = fetch;

		this.reset();

	}

	objectAt(idx) {
		return this[idx];
	}

	reset() {
		this.length = 0;
		this.loaded = false;
		this.failure = undefined;
		notifyPropertyChange(this, '[]');
		this.loadmore(0);
	}

	loadmore(idx) {

		let limit = this.limit;
		let index = Math.floor(idx / limit);
		let start = index * limit;
		let props = { start, limit };

		if (start < this.length) {
			props.start = this.length;
		}

		this.fetcher(props);

	}

	fulfillObjectsAt({ start, limit }, array) {
		for (let i = start; i < (start + array.length); i++) {
			this[i] = array[i-start];
		}
	}

	async fetcher(rng) {

		// `failure` describes the most recent attempt, so it is cleared as one
		// starts. Without this a list that failed once stayed failed: nothing
		// else ever wrote the field, so a later successful load still reported
		// the old error and any consumer branching on it kept its error state.

		this.failure = undefined;

		try {

			if (this.cancel) this.cancel();

			[this.ctx, this.cancel] = context.withCancel();

			let array = await this.fetch(this.ctx, rng);

			let items = [].concat(array);

			this.fulfillObjectsAt(rng, items);

			this.length = rng.start + items.length;

			this.loaded = true;

		} catch (error) {

			// See the note in sparse/index.js — an expected cancellation stays
			// quiet, anything else must be visible rather than swallowed.

			this.failure = error;

			if (error !== undefined && error.message !== 'context cancelled') {
				console.error('infinite: fetch failed, the list will not load', error);
			}

		}

		notifyPropertyChange(this, '[]');

	}

}
