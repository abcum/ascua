import { tracked } from '@glimmer/tracking';

export default class Queue {

	#ctx = undefined;

	#fnc = undefined;

	#queue = [];

	#working = false;

	@tracked length = 0;

	constructor(ctx, fnc) {

		this.#ctx = ctx;

		this.#fnc = fnc;

	}

	async queue() {

		return new Promise( (resolve, reject) => {

			this.#queue.push({
				promise: this.#fnc.bind(this.#ctx, ...arguments),
				resolve,
				reject,
			});

			this.length = this.#queue.length + (this.#working ? 1 : 0);

			this.dequeue();

		});

	}

	async dequeue() {

		if (this.#working) {
			return false;
		}

		const item = this.#queue.shift();

		if (!item) {
			this.length = 0;
			return false;
		}

		try {
			this.#working = true;
			this.length = this.#queue.length + 1;
			let v = await item.promise();
			item.resolve(v);
		} catch (e) {
			item.reject(e);
		} finally {
			this.#working = false;
			this.length = this.#queue.length;
			this.dequeue();
		}

	}

	cancel() {
		this.#queue = [];
		this.length = 0;
	}

}
