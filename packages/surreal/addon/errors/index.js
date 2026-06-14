// Error types for @ascua/surreal.
//
// The legacy client exposed these named error classes; the official
// SurrealDB SDK instead reports failures as `SurrealError`. We keep the
// historical names here (as local Error subclasses) so consumers that
// import them continue to resolve, plus the internal DestroyedError.
//
// NOTE: the new SDK does not throw these specific types — call sites that
// rely on `instanceof RecordError` etc. should be revisited against the
// SDK's error semantics (a missing record now resolves to `undefined`
// rather than throwing).

function define(name) {
	return class extends Error {
		constructor(message) {
			super(message);
			this.name = name;
		}
	};
}

export const ServerError = define('ServerError');
export const RecordError = define('RecordError');
export const PermsError = define('PermsError');
export const ExistError = define('ExistError');
export const FieldError = define('FieldError');
export const IndexError = define('IndexError');
export const TimerError = define('TimerError');
export const DestroyedError = define('DestroyedError');

export default {
	ServerError,
	RecordError,
	PermsError,
	ExistError,
	FieldError,
	IndexError,
	TimerError,
	DestroyedError,
};
