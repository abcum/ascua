import Item from './item';
import Range from './range';
import { tracked } from '@glimmer/tracking';

const FETCH = function() {
	return { data: [], total: 0 };
};

export default class extends Array {

	limit = 0;

	total = 0;

	fetch = 0;

	ranges = {};

	@tracked loaded = false;

	@tracked failure = undefined;

	constructor(limit, fetch = FETCH) {

		super();

		this.limit = limit;
		this.fetch = fetch;

		this.reset();

	}

	objectAt(idx, fetch = false) {
		switch (fetch) {
		case false:
			return this.sparseObjectAt(idx);
		case true:
			return this.returnObjectAt(idx);
		}
	}

	reset() {
		this.total = 0;
		this.length = 0;
		this.loaded = false;
		this.notifyPropertyChange('[]');
		this.remoteObjectAt(0);
	}

	range(rng) {
		return this.ranges[rng.start] ?
			this.ranges[rng.start] :
			this.ranges[rng.start] = new Range(rng)
		;
	}

	sparseObjectAt(idx) {
		return this[idx] = this[idx] || Item.create();
	}

	returnObjectAt(idx) {
		let item = this.sparseObjectAt(idx);
		return item.content ? item : this.remoteObjectAt(idx);
	}

	remoteObjectAt(idx) {

		let limit = this.limit;
		let index = Math.floor(idx / limit);
		let start = index * limit;
		let props = { start, limit };

		this.fetcher(props);

		return this[idx];

	}

	fulfillObjectsAt({ start, limit }, array) {
		for (let i = start; i < (start + limit) && i < this.total; i++) {
			this[i] = this[i] || Item.create();
			this[i].resolve(array.objectAt(i-start));
		}
	}

	async fetcher(rng) {

		try {

			let range = this.range(rng);

			let array = await range.fetch(this.fetch);

			let items = [].concat(array.data);

			this.length = array.total;

			this.total = array.total;

			this.fulfillObjectsAt(rng, items);

			this.loaded = true;

		} catch (error) {

			// A range is cancelled whenever the list resets, and that rejection
			// is expected, so it stays quiet. Anything else means the list will
			// sit on "Loading" forever, so it must be visible rather than
			// swallowed — record it and report it.

			this.failure = error;

			if (error !== undefined && error.message !== 'context cancelled') {
				console.error('sparse: fetch failed, the list will not load', error);
			}

		}

		this.notifyPropertyChange('[]');

	}

}
