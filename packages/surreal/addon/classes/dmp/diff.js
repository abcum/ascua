import { typeOf } from '@ember/utils';
import { Value } from 'surrealdb';
import DMP from 'dmp';
import { compare } from '../../utils/stable';

const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

// A stable, sorted-key stringification used only to test equality, not to
// build a payload. Shared with classes/field/array.js, which needs the same
// comparison — see utils/stable.js for why it is not a one-liner.
const json = compare;

// Whether a key can be named inside a patch path at all.
//
// SurrealDB splits a patch path on `/` AND on `.`, and supports no escaping
// for either - verified directly against 3.2.3: patching `/blob/a~1b`, the
// RFC 6901 escape for a key `a/b`, creates a literal `a~1b` key, while both
// `/blob/a/b` and `/blob/a.b` write to a nested `{ a: { b } }` instead of to
// the key that was meant. So there is no encoding that reaches such a key,
// and descending into an object that has one silently writes to the wrong
// place. The containing object is replaced wholesale instead - the same
// approach `arr()` already takes for an element that cannot be patched in
// place.
//
// Only an `@any` field (or a plain object nested inside one) can hold keys
// like these; a declared field name is always a JS identifier.

function nameable(key) {
	return !key.includes('/') && !key.includes('.');
}

function route(path, part) {
	if (path.length === 0) {
		return '/' + part;
	} else {
		if (part[0] === '/') {
			return path + part;
		} else {
			return path + '/' + part;
		}
	}
}

export default class Diff {

	constructor(old={}, now={}) {

		this.ops = [];

		this.obj(old, now, '');

	}

	output() {

		return this.ops;

	}

	op(op, path, value) {

		this.ops.push({ op, path, value });

	}

	val(old, now, path='') {

		// SurrealDB value types (RecordId, DateTime, Decimal, ...) are opaque
		// leaves: compare by their string form, and emit the native instance
		// unchanged so it reaches the SDK correctly typed.
		if (old instanceof Value || now instanceof Value) {
			if (String(old) !== String(now)) {
				this.op('replace', path, now);
			}
			return;
		}

		if (old === now) {
			return;
		}

		if ( typeOf(old) !== typeOf(now) ) {
			this.op('replace', path, now);
			return;
		}

		switch (typeof old) {
		case 'string':
			let v = regex.exec(now);
			if (v) {
				this.op('replace', path, now);
			} else {
				this.txt(old, now, path);
			}
			return;
		case 'object':
			if (Array.isArray(old)) {
				this.arr(old, now, path);
			} else {
				this.obj(old, now, path);
			}
			return;
		default:
			this.op('replace', path, now);
			return;
		}

	}

	obj(old={}, now={}, path='') {

		// If any key here cannot be named in a path, replace this object
		// rather than trying to address its members. Skipped at the root,
		// where the keys are declared field names and there is no enclosing
		// object to replace.

		if (path !== '') {

			let awkward = false;

			for (let k in old) if (!nameable(k)) { awkward = true; break; }
			if (!awkward) for (let k in now) if (!nameable(k)) { awkward = true; break; }

			if (awkward) {
				// Still only when something actually changed. Replacing
				// unconditionally would make any record holding such a key
				// permanently dirty, so every load would queue a save.
				if (json(old) !== json(now)) this.op('replace', path, now);
				return;
			}

		}

		for (let k in old) {

			let p = route(path, k);

			// Value no longer exists
			if (k in now === false) {
				this.op('remove', p, now[k]);
				continue;
			}

		}

		for (let k in now) {

			let a = now[k];
			let b = old[k];
			let p = route(path, k);

			// Value did not previously exist
			if (k in old === false) {
				this.op('add', p, a);
				continue;
			}

			// Value is now completely different
			if ( typeOf(a) !== typeOf(b) ) {
				this.op('replace', p, a);
				continue;
			}

			// Check whether the values have changed
			this.val(b, a, p);

		}

	}

	arr(old=[], now=[], path='') {

		// A `replace`/`change` op whose path runs through an array index
		// silently no-ops against SurrealDB (3.2.3, confirmed directly
		// against the server: PATCH replace at `/tags/0` or
		// `/details/0/isbn` both return 200 with the array left
		// completely unchanged - `add`/`remove` at an index are fine, it
		// is specifically an in-place replace of an existing element that
		// the server drops). So an existing shared index whose value
		// changed can't be patched in place; the whole array is replaced
		// instead, at this array's own (index-free) path - add/remove for
		// a pure length change is unaffected and stays as the minimal op.

		for (let i=0; i < old.length && i < now.length; i++) {
			if (json(old[i]) !== json(now[i])) {
				this.op('replace', path, now);
				return;
			}
		}

		for (let j = old.length; j < now.length; j++) {
			let p = route(path, j);
			let v = now[j];
			this.op('add', p, v);
		}

		for (let j = old.length - 1; j >= now.length; j--) {
			let p = route(path, j);
			let v = undefined;
			this.op('remove', p, v);
		}

	}

	txt(old='', now='', path='') {

		let dmp = new DMP();

		let pch = dmp.patch_make(old, now);

		let txt = dmp.patch_toText(pch);

		this.op('change', path, txt);

	}

}
