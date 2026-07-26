import Service from '@ember/service';
import Storage from '../classes/storage';

export default class extends Service {
	#ls = new Storage();

	constructor() {
		super(...arguments);

		if (window && window.addEventListener) {
			window.addEventListener('storage', (e) => {
				this.notifyPropertyChange(e.key);
			});
		}
	}

	// Values are stored JSON encoded and read back JSON decoded, so that what
	// comes out is always what went in.
	//
	// Encoding used to be asymmetric — scalars were written raw and objects
	// were written as JSON, then on read a value was only decoded when it
	// parsed back to an *object*. That silently corrupted anything whose JSON
	// form is a scalar: a value with a string `toJSON()` (a SurrealDB
	// `RecordId`, a `Date`) was written as `"tb:id"` and read back with its
	// quotes still attached. It also could not tell the string "null" from
	// null, or the string "12" from 12.
	//
	// Values written before this change are still read correctly: their raw
	// form either parses as JSON already (`null`, `true`, `12`, `{…}`, `[…]`)
	// or fails to parse and is returned as the string it is.

	unknownProperty(key) {
		let val = this.#ls.get(key);

		if (val === null || val === undefined) {
			return undefined;
		}

		try {
			return JSON.parse(val);
		} catch (e) {
			return val;
		}
	}

	setUnknownProperty(key, val) {
		let json = val === undefined ? undefined : JSON.stringify(val);

		// `JSON.stringify` yields undefined rather than a string for values
		// which have no JSON form — a function, a symbol — so those clear the
		// key instead of storing the text "undefined".

		if (json === undefined) {
			this.#ls.del(key);
			return this.notifyPropertyChange(key);
		}

		this.#ls.set(key, json);

		return this.notifyPropertyChange(key);
	}
}
