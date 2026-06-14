import { RecordId, StringRecordId, DateTime } from 'surrealdb';
import meta from '../classes/meta';

// Build a plain snapshot of a model/field's data, keeping SurrealDB value
// types native: record links stay as RecordId instances and datetimes are
// produced as DateTime instances, so the same snapshot is used both for
// diffing and as the payload sent to the SDK (no string round-tripping).
//
// The field kind comes from the field metadata (registered by the field
// decorators), so datetimes are converted by *declared type*, never by
// guessing the shape of a string value.

function datetime(v) {
	if (v === null || v === undefined) return null;
	if (v instanceof DateTime) return v;
	return new DateTime(v instanceof Date ? v : new Date(String(v)));
}

function record(v) {
	if (v === null || v === undefined) return null;
	if (v instanceof RecordId || v instanceof StringRecordId) return v;
	// a record field's value is a Record proxy whose toJSON() yields its
	// native RecordId — no `tb:id` string is ever materialised here
	return (typeof v.toJSON === 'function' ? v.toJSON() : v) ?? null;
}

function element(e, type, mode) {
	if (e === null || e === undefined) return null;
	if (type === 'datetime') return datetime(e);
	if (typeof e === 'object') {
		if (('_' + mode) in e) return e['_' + mode];        // embedded Field/Model
		if (e instanceof DateTime) return e;
		if (e instanceof RecordId || e instanceof StringRecordId) return e;
		if (typeof e.toJSON === 'function') return e.toJSON(); // record proxy -> RecordId
		return e;
	}
	return e;
}

function field(value, desc, mode) {
	if (value === null || value === undefined) return null;
	switch (desc.kind) {
		case 'record':
			return record(value);
		case 'datetime':
			return datetime(value);
		case 'object':
			return value['_' + mode] ?? null;
		case 'array':
			return Array.isArray(value) ? value.filter(e => e !== undefined).map(e => element(e, desc.type, mode)) : null;
		default:
			return value;
	}
}

function build(object, mode) {
	let out = {};
	meta.all(object).forEach(p => {
		if (mode === 'some' && p.readonly) return;
		out[p.name] = field(object[p.name], p, mode);
	});
	return out;
}

export function full(object) {
	return build(object, 'full');
}

export function some(object) {
	return build(object, 'some');
}

export default { full, some };
