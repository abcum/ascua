import { TrackedArray, TrackedObject } from 'tracked-built-ins';

export default class Cache {
  #data = new TrackedObject({});

  get(model) {
    return (this.#data[model] = this.#data[model] || new TrackedArray([]));
  }

  del(model) {
    this.#data[model] = [];
  }

  clear() {
    for (const k in this.#data) {
      this.del(k);
    }
  }
}
