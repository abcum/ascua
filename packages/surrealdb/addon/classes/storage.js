import test from '../utils/test';

const enabled = test();

export default class Storage {
  #data = {};

  set(id, val) {
    switch (enabled) {
      case true:
        return window.localStorage.setItem(id, val);
      case false:
        return (this.#data[id] = val || undefined);
    }
  }

  get(id) {
    switch (enabled) {
      case true:
        return window.localStorage.getItem(id);
      case false:
        return this.#data[id] || undefined;
    }
  }

  del(id) {
    switch (enabled) {
      case true:
        return window.localStorage.removeItem(id);
      case false:
        return delete this.#data[id];
    }
  }

  clear() {
    switch (enabled) {
      case true:
        return window.localStorage.clear();
      case false:
        return (this.#data = {});
    }
  }
}
