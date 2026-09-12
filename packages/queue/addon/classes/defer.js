import { tracked } from '@glimmer/tracking';

export default class Defer {

	#ctx = undefined;

	#fnc = undefined;

	#queue = [];

	#working = false;

	#promise = undefined;

	// Resolves once the execution currently in flight (if any) has settled,
	// whatever its outcome - `settle()` never rejects, since it only signals
	// "nothing more is happening right now", not the result of that work.
	// `#queue`/`#working` alone can't answer that from outside the class:
	// they're private, and `#working` flips back to `false` synchronously in
	// the same tick a caller's own `.catch()` on `queue()` runs, so a caller
	// racing `delete()` against an already in-flight `queue()` has nothing to
	// await that is guaranteed to resolve after the request has actually
	// reached the server.

	#current = undefined;

	@tracked length = 0;

	constructor(ctx, fnc) {

		this.#ctx = ctx;

		this.#fnc = fnc;

	}

	async settle() {
		if (this.#current) await this.#current;
	}

	async queue() {

		return new Promise( (resolve, reject) => {

			this.#promise = this.#fnc.bind(this.#ctx, ...arguments);

			this.#queue.push({
				resolve,
				reject,
			});

			this.dequeue();

		});

	}

	async dequeue() {

		this.length = this.#queue.length;

		if (this.#working) {
			return false;
		}

		const item = this.#promise;
		const resp = this.#queue;
		this.#promise = null;
		this.#queue = [];

		if (!item) return false;

		let done;
		this.#current = new Promise(res => { done = res; });

		try {
			this.#working = true;
			let v = await item();
			for (let r of resp) {
				r.resolve(v);
			}
		} catch (e) {
			for (let r of resp) {
				r.reject(e);
			}
		} finally {
			this.#working = false;
			done();
			this.#current = undefined;
			this.dequeue();
		}

	}

	cancel() {
		this.#promise = null;
		this.#queue = [];
		this.length = 0;
	}

}
