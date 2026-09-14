import Model from '../model';
import { RecordId, StringRecordId, Table } from 'surrealdb';

// Builds a SurrealDB record pointer from a table name and a flexible id, so
// callers building a payload can pass whatever they already have in hand
// instead of extracting its id themselves.
//
// A `Model` is unwrapped to its own `.id` (already a native RecordId), a
// `RecordId`/`StringRecordId` is returned as-is, a full `"table:id"` string
// becomes a `StringRecordId`, a bare id is paired with `tb` into a `RecordId`,
// and `undefined`/`null` targets the whole table.
//
// Unwrapping a `Model` first, rather than reading `id.id`, matters: a native
// RecordId also exposes its own `.id` — the bare local part, table stripped —
// so treating the two the same silently drops the table prefix for anything
// that was already a RecordId.

export default function thing(tb, id) {

	if (id instanceof Model) {
		return thing(tb, id.id);
	}

	switch (true) {
		case id === undefined || id === null:
			return new Table(tb);
		case id instanceof RecordId || id instanceof StringRecordId:
			return id;
		case typeof id === 'string' && id.includes(':'):
			return new StringRecordId(id);
		default:
			return new RecordId(tb, id);
	}

}
