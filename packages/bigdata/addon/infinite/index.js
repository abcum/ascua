import context from '@ascua/context';
import { tracked } from '@glimmer/tracking';

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
		this.notifyPropertyChange('[]');
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
			this[i] = array.objectAt(i-start);
		}
	}

	async fetcher(rng) {

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

		this.notifyPropertyChange('[]');

	}

}
