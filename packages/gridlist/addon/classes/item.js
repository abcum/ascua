import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';

export default class extends Object {

	@tracked elect;

	@tracked index;

	@tracked model;

	// The selection is a list of ids that also travels through the URL, so it
	// has to be strings. Since SurrealDB 3.x a record id is a native RecordId,
	// and two RecordIds for the same record are never `===`, so comparing them
	// against the selection silently never matches: no row highlights, and a
	// toggle can only ever add, appending the same id over and over.

	get id() {
		let id = get(this.model, 'id');
		return id === null || id === undefined ? id : String(id);
	}

}
