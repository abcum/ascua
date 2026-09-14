import DMP from 'dmp';

// Replays the operations `Diff` produced, locally. `Model#ingest` uses it to
// re-apply changes the user made while a save was in flight on top of the
// state the server just sent back, so anything it gets wrong is a local edit
// that silently disappears.
//
// Paths are walked a segment at a time rather than being flattened into a
// dotted string: `"/a/b"` and a key literally named `"a.b"` flatten to the
// same thing, so one could be applied to the other.

function segments(path) {
	return path.split('/').slice(1);
}

function parent(obj, parts) {
	let o = obj;
	for (let i = 0; i < parts.length - 1; i++) {
		if (o[parts[i]] === null || typeof o[parts[i]] !== 'object') {
			o[parts[i]] = {};
		}
		o = o[parts[i]];
	}
	return o;
}

function getByPath(obj, parts) {
	return parent(obj, parts)[parts[parts.length - 1]];
}

function setByPath(obj, parts, value) {
	parent(obj, parts)[parts[parts.length - 1]] = value;
}

function delByPath(obj, parts) {
	let o = parent(obj, parts);
	let key = parts[parts.length - 1];

	// Splice, rather than `delete`, when removing from an array.
	//
	// `delete arr[i]` leaves a hole: the slot is empty but the length is
	// unchanged, so the merged object this class is supposed to hand back
	// was not the state it claimed to represent - `[1, 2, 3]` with the last
	// element removed came out as length 3 with a hole on the end rather
	// than as `[1]`.
	//
	// Today's only caller, `Model#ingest`, happens to tolerate that: a
	// trailing hole is skipped by the `forEach` in classes/field/array.js and
	// does not shorten the array it is applied to, and the record's own
	// client snapshot is taken from the shadow rather than from this result.
	// So this is a contract fix rather than a fix for an observed symptom -
	// but a merge step that returns the wrong array is not something to leave
	// standing, and only a trailing removal reaches it at all (`Diff.arr()`
	// replaces the whole array for anything else).
	//
	// `Diff.arr()` emits removals highest-index-first, so splicing them in
	// the order they arrive is safe.

	if (Array.isArray(o)) {
		let index = Number(key);
		if (Number.isInteger(index) && index >= 0 && index < o.length) {
			o.splice(index, 1);
			return;
		}
	}

	delete o[key];
}

export default class Patch {

	constructor(old={}, ops=[]) {

		this.obj = old;

		this.pch(ops);

	}

	output() {

		return this.obj;

	}

	pch(ops=[]) {

		ops.forEach(v => {

			let p = segments(v.path);

			switch (v.op) {
				case 'add':
					setByPath(this.obj, p, v.value);
					return;
				case 'remove':
					delByPath(this.obj, p);
					return;
				case 'replace':
					setByPath(this.obj, p, v.value);
					return;
				case 'change': {
					let dmp = new DMP();
					let txt = getByPath(this.obj, p);
					let pch = dmp.patch_fromText(v.value);
					let [done] = dmp.patch_apply(pch, txt);
					setByPath(this.obj, p, done);
					return;
				}
			}

		});

	}

}
