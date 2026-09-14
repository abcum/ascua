// A stable, order-independent stringification of a value, used ONLY to test
// two values for equality — never to build a payload.
//
// This replaces `JSON.stringify(o, Object.keys(o).sort())`, which read as
// "stringify with sorted keys" but does something else entirely: an ARRAY
// passed as `JSON.stringify`'s second argument is a property allowlist, not a
// key order, and it is applied at EVERY level of nesting. Since the allowlist
// was built from the top-level keys only, every nested object was serialised
// as `{}` — so any two values differing only below the first level compared
// as equal.
//
// Two places relied on that comparison, and both silently lost changes:
//
//   * `classes/dmp/diff.js` decides whether an array element changed. A user
//     editing a value inside an element (a contact's custom field, an email
//     address, a phone number) produced NO patch operation at all, so the
//     edit was never sent — the UI kept the typed value until a refresh
//     revealed it had never been saved.
//
//   * `classes/field/array.js` decides whether an incoming element should
//     replace the one already held. A server-side change inside an element
//     (a live query, or a reload) was discarded, so the record stayed stale
//     until the whole app was reloaded.
//
// Keys are sorted at every level so that two objects with the same contents
// in a different insertion order still compare equal — the property the
// original code was reaching for.

export default function stable(value) {

	if (value === null || value === undefined) return 'null';

	if (typeof value !== 'object') return JSON.stringify(value) ?? 'null';

	if (Array.isArray(value)) {
		return '[' + value.map(stable).join(',') + ']';
	}

	return '{' + Object.keys(value).sort().map(
		(k) => JSON.stringify(k) + ':' + stable(value[k]),
	).join(',') + '}';

}

// Normalise first (so a Model, Field or RecordArray is reduced through its
// own `toJSON`), then compare structurally. A value that cannot be
// normalised — a cycle, most likely — falls back to a plain stringify, which
// is what the callers did before.

export function compare(value) {
	try {
		return stable(JSON.parse(JSON.stringify(value)));
	} catch (e) {
		return JSON.stringify(value);
	}
}
