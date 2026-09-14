import Property from './property';
import Record from '../types/record';
import Model from '@ascua/surreal/model';
import { RecordId, StringRecordId } from 'surrealdb';
import thing from '../../utils/thing';
import { RECORD } from '../model';

export default function(type) {
	return Property({
		get(key) {

			let value = this[RECORD].data[key];

			switch (true) {
			case value === null:
				return this[RECORD].data[key];
			case value === undefined:
				return this[RECORD].data[key];
			case value instanceof Record:
				return this[RECORD].data[key];
			default:
				let cached = this.store.cached(type, value);
				if (cached) {
					return this[RECORD].data[key] = this.store.proxy({
						id: value, content: cached,
					});
				} else {
					return this[RECORD].data[key] = this.store.proxy({
						id: value, promise: () => this.store.select(type, value)
					});
				}
			}

		},
		set(key, value) {

			switch (true) {
			case value === null:
				return this[RECORD].data[key] = value;
			case value === undefined:
				return this[RECORD].data[key] = value;
			case value instanceof Record:
				return this[RECORD].data[key] = value;
			// a native RecordId is a record pointer: wrap it in a (lazy)
			// proxy keyed by the RecordId itself — never stringified here
			case value instanceof RecordId || value instanceof StringRecordId: {
				let cached = this.store.cached(type, value);
				return this[RECORD].data[key] = this.store.proxy(cached
					? { id: value, content: cached }
					: { id: value, promise: () => this.store.select(type, value) });
			}
			case value === String(this[RECORD].data[key]):
				return this[RECORD].data[key] = this[RECORD].data[key];
			case value instanceof Model:
				return this[RECORD].data[key] = this.store.proxy({
					id: value.id, content: value,
				});
			case value instanceof Object:
				return this[RECORD].data[key] = this.store.proxy({
					id: value.id, content: this.store.inject(value),
				});
			default: {

				// Anything else is an id in some other form - a `"tb:id"`
				// string, or a bare id - so normalise it to a native record
				// pointer FIRST, and key the proxy off that.
				//
				// Keeping the raw value meant the proxy's `toJSON()` handed
				// utils/json.js a plain string, which went into the payload as
				// a string and was rejected outright: "Expected `record<...>`
				// but found `'tb:id'`". The autosave then failed and rolled
				// back, so assigning a link from an id that had been through
				// `JSON.stringify` - out of local storage, or a cloned
				// settings object - silently never saved.
				//
				// It also fixes the cache lookup for a bare id: `cached()`
				// compares stringified ids, and a bare `"id"` never matched
				// the record's own `"tb:id"`.

				let id = thing(type, value);

				let cached = this.store.cached(type, id);

				return this[RECORD].data[key] = this.store.proxy(cached
					? { id, content: cached }
					: { id, promise: () => this.store.select(type, id) });

			}
			}

		},
	}, { kind: 'record', type });
}
