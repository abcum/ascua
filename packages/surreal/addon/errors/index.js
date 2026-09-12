// Error types for @ascua/surreal.
//
// The legacy client exposed a wider set of named error classes; the
// official SurrealDB SDK instead reports failures as `SurrealError`, and
// a missing record now resolves to `undefined` rather than throwing. Only
// DestroyedError is still used internally, by fields on a record that has
// since been destroyed/removed from the store.

function define(name) {
	return class extends Error {
		constructor(message) {
			super(message);
			this.name = name;
		}
	};
}

export const DestroyedError = define('DestroyedError');

export default {
	DestroyedError,
};
