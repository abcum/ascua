import Property from './property';
import Field from '@ascua/surreal/field';
import { assert } from '@ember/debug';
import { setProperties } from '@ember/object';
import { DestroyedError } from '@ascua/surreal/errors';
import { RECORD } from '../model';
import meta from '../meta';

export default function(type) {
	return Property({
		get(key) {

			try {

				let model = this.store.lookup(type);

				if (model && model.class.prototype instanceof Field) {
					return this[RECORD].data[key] = this[RECORD].data[key] || model.create({ parent: this });
				}

				assert('An embedded object must be of type Field');

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else {
					throw e;
				}

			}

		},
		set(key, value={}) {

			try {

				let model = this.store.lookup(type);

				if (model && model.class.prototype instanceof Field) {
					switch (true) {
					case this[RECORD].data[key] !== undefined: {

						// Assigning an object REPLACES it, so a property the
						// incoming value does not carry is cleared rather than
						// left where it was — matching what assigning an array
						// already does (it truncates to the new length).
						//
						// `setProperties` alone only ever writes the keys it is
						// handed, so a property the server had cleared survived
						// locally: `ingest` assigns the merged server state
						// through here, and a snapshot omits absent fields
						// entirely (see utils/json.js), so a cleared value
						// arrived as a missing key and was silently ignored.
						// The stale value then stayed on screen until the whole
						// app was reloaded.

						const field = this[RECORD].data[key];

						const absent = {};

						for (const p of meta.all(field)) {
							if (p.readonly) continue;
							if (value && p.name in value) continue;
							absent[p.name] = undefined;
						}

						setProperties(field, Object.assign(absent, value));

						return field;

					}
					case this[RECORD].data[key] === undefined:
						const field = model.create(value);
						field.parent = this;
						return this[RECORD].data[key] = field;
					}
				}

				assert('An embedded object must be of type Field');

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else {
					throw e;
				}

			}

		},
	}, { kind: 'object', type });
}
