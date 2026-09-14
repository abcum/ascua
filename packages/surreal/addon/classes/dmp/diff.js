import { typeOf } from '@ember/utils';
import { Value } from 'surrealdb';
import DMP from 'dmp';
import { compare } from '../../utils/stable';

const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

// A stable, sorted-key stringification used only to test equality, not to
// build a payload. Shared with classes/field/array.js, which needs the same
// comparison — see utils/stable.js for why it is not a one-liner.
const json = compare;

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
