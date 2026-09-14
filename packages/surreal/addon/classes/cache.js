import Array from './array';

export default class Cache {

	#data = {};

	get(model) {
		return this.#data[model] = this.#data[model] || new Array();
	}

	// Every record currently cached, across every table.

	all() {
		let out = [];
		for (const k in this.#data) {
			for (const record of this.#data[k]) out.push(record);
		}
		return out;
	}

	del(model) {
		this.#data[model].clear();
	}

	clear() {
		for (const k in this.#data) {
			this.del(k);
		}
	}

}
