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

	// Whether `total` is the real count rather than a provisional one.
	// Only ever false while a deferred total is outstanding — see `fetcher`.
	// A list that shows its length has to be able to tell the two apart, or
	// it renders the size of the first page as though it were the answer.

	@tracked counted = true;

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
		this.counted = true;
		this.failure = undefined;
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

	// Place the rows of one page against a total that has not arrived yet.
	//
	// `fulfillObjectsAt` will not place a row past `this.total`, so a fetch
	// cannot show anything until the total is known. Sizing the list to the end
	// of this page instead lets the page render, and `settleTotal` widens it
	// once the real count lands.
	//
	// The visible cost is the scroll region: it is as tall as the rows fetched
	// so far, then grows when the total arrives. That is the whole trade — a
	// list that paints immediately and a scrollbar that resizes once, against a
	// list that paints nothing until a count returns.

	fulfillPartially(rng, items) {

		let provisional = rng.start + items.length;

		if (provisional > this.total) {
			this.length = provisional;
			this.total = provisional;
		}

		this.counted = false;

		this.fulfillObjectsAt(rng, items);

		this.loaded = true;

		this.notifyPropertyChange('[]');

	}

	settleTotal(total) {

		this.counted = true;

		if (total === this.total) return;

		this.length = total;

		this.total = total;

		this.notifyPropertyChange('[]');

	}

	async fetcher(rng) {

		// `failure` describes the most recent attempt, so it is cleared as one
		// starts. Without this a list that failed once stayed failed: nothing
		// else ever wrote the field, so a later successful load still reported
		// the old error and any consumer branching on it kept its error state.

		this.failure = undefined;

		try {

			let range = this.range(rng);

			let array = await range.fetch(this.fetch);

			let items = [].concat(array.data);

			// A fetch may hand back `total` as a promise rather than a number.
			// That is the opt-in: the rows are placed as soon as they arrive and
			// the count settles the list afterwards, for a source where the two
			// cost very different amounts. A permission-checked `count()` over a
			// large table is the case this exists for — the rows come back in
			// well under a second while the count walks every row.
			//
			// Returning a number keeps the original behaviour exactly: nothing
			// renders until the total is known.

			if (typeof array.total?.then === 'function') {

				this.fulfillPartially(rng, items);

				this.settleTotal(await array.total);

				return;

			}

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
