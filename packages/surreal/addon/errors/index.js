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

// Raised when a record arrives for a table which has no `model:` defined.
//
// Without it the failure was a bare `Cannot read properties of undefined
// (reading 'class')` from inside `store.lookup`, with nothing naming the
// table - and because injection happens inside event handlers nothing awaits
// (a live notification, the `authenticated` hook in services/session.js), it
// surfaced as an unhandled global error that took down whatever happened to
// be running rather than as a fault in the record that caused it.

export const MissingModelError = define('MissingModelError');

export default {
	DestroyedError,
	MissingModelError,
};
