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
		// `this.model` can be an ObjectProxy (e.g. @ascua/bigdata's sparse/
		// infinite Item), which asserts in dev builds if `.id` is read
		// directly instead of through get() - confirmed live: replacing
		// this with `this.model?.id` crashed the whole render tree with
		// "you attempted to access the `id` property... it is still
		// necessary to use `.get('id')` in this case" the moment a proxied
		// record reached this getter.
		let id = get(this.model, 'id');
		return id === null || id === undefined ? id : String(id);
	}

}
