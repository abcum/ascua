import { StringRecordId, DateTime } from 'surrealdb';
import Field from '@ascua/surreal/field';
import meta from '../classes/meta';

// The model and field layers keep their internal data, snapshots, and diffs
// in plain-JSON form (record links as `tb:id` strings, datetimes as ISO
// strings). SurrealDB 3.x is strict about types on the wire, so before data
// is sent to the SDK it must be converted into the appropriate value types:
// record links become `StringRecordId` instances and datetimes become
// `DateTime` instances. This module performs that field-aware conversion,
// recursing into embedded objects and arrays using the field metadata.

// Convert a single `tb:id` string (or record proxy) into a StringRecordId.

function record(value) {
	if (value === null || value === undefined || value === '') return value;
	return new StringRecordId(String(value));
}

// Convert an ISO datetime string (or Date) into an SDK DateTime instance.

function datetime(value) {
	if (value === null || value === undefined || value === '') return value;
	return new DateTime(value instanceof Date ? value : new Date(String(value)));
}

// Resolve the field descriptor for an array element, given the array's
// declared element type. Primitive element types need no conversion, while
// embedded `Field` types recurse and everything else is a record link.

function element(type, store) {
	switch (type) {
		case undefined:
		case 'string':
		case 'number':
		case 'boolean':
			return { kind: 'value' };
		case 'datetime':
			return { kind: 'datetime' };
		default:
			try {
				let model = store.lookup(type);
				if (model && model.class.prototype instanceof Field) {
					return { kind: 'object', type };
				}
			} catch (e) {
				// ignore — fall through to record link
			}
			return { kind: 'record', type };
	}
}

// Convert a plain-JSON value into its wire form, driven by a field descriptor
// ({ kind, type }). Used for both whole-record payloads and individual patch
// operation values.

export function value(v, desc, store) {
	if (v === null || v === undefined) return v;
	switch (desc && desc.kind) {
		case 'record':
			return record(v);
		case 'datetime':
			return datetime(v);
		case 'object':
			return fields(v, store.lookup(desc.type).class.prototype, store);
		case 'array':
			return Array.isArray(v) ? v.map(e => value(e, element(desc.type, store), store)) : v;
		default:
			return v;
	}
}

// Convert a plain-JSON object into its wire form, using the field metadata
// declared on the supplied prototype (or instance). Keys without metadata are
// passed through unchanged.

export function fields(object, target, store) {
	let out = {};
	for (let key in object) {
		if (key === 'id') continue;
		let desc = meta.get(target, key);
		out[key] = desc ? value(object[key], desc, store) : object[key];
	}
	return out;
}

// Resolve the field descriptor at a JSON-pointer path (e.g. `/times/created`)
// by walking the field metadata, descending through embedded objects and
// array element types. Used to type-convert patch operation values.

export function descriptor(record, segments, store) {
	let target = record;
	let desc = null;
	for (let seg of segments) {
		if (/^\d+$/.test(seg)) {
			if (desc && desc.kind === 'array') {
				desc = element(desc.type, store);
				target = desc.kind === 'object' ? store.lookup(desc.type).class.prototype : null;
			}
			continue;
		}
		if (!target) return null;
		desc = meta.get(target, seg);
		if (!desc) return null;
		target = desc.kind === 'object' ? store.lookup(desc.type).class.prototype : null;
	}
	return desc;
}

// Convert an array of JSON-Patch operations into their wire form, typing each
// operation's value according to the field it targets.

export function patch(record, ops, store) {
	return ops.map(op => {
		if (op.op === 'remove') {
			return { op: 'remove', path: op.path };
		}
		if (op.op === 'change') {
			return op;
		}
		let segments = op.path.split('/').filter(Boolean);
		let desc = descriptor(record, segments, store);
		return Object.assign({}, op, { value: value(op.value, desc, store) });
	});
}
