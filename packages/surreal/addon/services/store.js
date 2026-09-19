import Service from '@ember/service';
import Cache from '../classes/cache';
import { service } from '@ember/service';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import Model from '@ascua/surreal/model';
import count from "../builders/count";
import table from "../builders/table";
import hasher from "../builders/hasher";
import Record from '../classes/types/record';
import { DestroyedError, MissingModelError } from '../errors';

/**
 * Look a record up in one of the cache's arrays by its stringified id.
 *
 * Record ids are compared as strings because since SurrealDB 3.x an id is a
 * native RecordId, and two RecordIds for the same record are never `===`.
 *
 * The `get(arr, '[]')` is load-bearing and must not be dropped. Ember's
 * `findBy`, which this replaced, iterates with `objectAt` and so consumes the
 * array's tracked tag; a plain `Array.prototype.find` does not consume
 * anything. That difference only shows up on a *miss*: a getter that looks for
 * a record which has not arrived yet subscribes to nothing, so when the record
 * is later added to the cache nothing invalidates and the getter is never
 * recomputed. The value is correct the moment anything reads it again, which
 * makes this look like a rendering fault rather than a tracking one — a list
 * row paints with an unresolved link and stays blank while the model behind it
 * holds the right answer.
 *
 * Consuming '[]' unconditionally, before the scan, is what makes a miss
 * reactive: `addObject` dirties that tag, so every earlier miss recomputes.
 */

function lookup(arr, id) {
	// Reading '[]' is how an array's tracked tag is consumed; there is no
	// property-access equivalent, and dropping it makes a cache miss
	// non-reactive. See the note above this function.
	// eslint-disable-next-line ember/no-get
	get(arr, '[]');
	let sid = String(id);
	for (let i = 0; i < arr.length; i++) {
		let v = arr[i];
		if (v !== undefined && String(v.id) === sid) return v;
	}
	return undefined;
}

function lookupAll(arr, ids) {
	// Reading '[]' is how an array's tracked tag is consumed; there is no
	// property-access equivalent, and dropping it makes a cache miss
	// non-reactive. See the note above this function.
	// eslint-disable-next-line ember/no-get
	get(arr, '[]');
	let sids = ids.map(String);
	return arr.filter(v => v !== undefined && sids.includes(String(v.id)));
}

export default class Store extends Service {

	@service surreal;

	#cache = new Cache(); // Record cache

	#proxy = new Object(); // Cached record proxies

	#stack = new Object(); // Inflight data requests

	#stash = new Object(); // Data pushed from shoebox

	get fastboot() {
		return getOwner(this).lookup('service:fastboot');
	}

	constructor() {

		super(...arguments);

		if (this.fastboot) {

			if (this.fastboot.isFastBoot === true) {
				this.fastboot.shoebox.put('surreal', this.#stash);
			}

			if (this.fastboot.isFastBoot === false) {
				this.#stash = this.fastboot.shoebox.retrieve('surreal') || {};
			}

		}

	}

	/**
	 * When the store is to be destroyed, we
	 * destroy and clear all of the cached records.
	 *
	 * @returns {undefined} Does not return anything.
	 */

	willDestroy() {
		this.reset();
		super.willDestroy(...arguments);
	}

	/**
	 * Reset the store.
	 *
	 * @returns {undefined} Does not return anything.
	 */

	reset() {
		this.#cache.clear();
		for (let k in this.#proxy) {
			this.#proxy[k] = [];
			delete this.#proxy[k];
		}
		for (let k in this.#stack) {
			this.#stack[k] = [];
			delete this.#stack[k];
		}
	}

	/**
	 * Wait until nothing is left to write.
	 *
	 * `Model#save()` debounces for 500ms before it sends anything, so a record
	 * edited a moment ago has changes which exist only as a pending timer —
	 * invisible to any queue, and lost if the page goes away first. This waits
	 * out that window (only when something is actually dirty) and then drains
	 * every cached record's deferred write queues.
	 *
	 * Useful before tearing an app down — an Electron window closing on a
	 * half-typed field, say — and in tests, where a save outliving its test
	 * lands after the session has been invalidated and reports a failure
	 * against whatever happens to be running next.
	 *
	 * @returns {Promise} Resolves once every pending write has settled.
	 */

	async settle() {

		let records = this.#cache.all();

		if (records.some(record => record.dirty)) {
			// The debounce is a plain timer; there is nothing to await but it.
			await new Promise(resolve => setTimeout(resolve, 600));
			records = this.#cache.all();
		}

		for (const record of records) {
			// `settle()` never rejects — it reports that nothing is still in
			// flight, not whether the writes succeeded.
			await record._modify.settle();
			await record._update.settle();
			await record._delete.settle();
		}

	}

	/**
	 * Lookup the model by its name.
	 *
	 * @returns {Model} The class for the desired model.
	 */
	lookup(model) {
		let owner = getOwner(this);
		if (owner.isDestroyed) {
			throw new DestroyedError();
		} else {
			let found = owner.factoryFor(`model:${model}`);
			if (found === undefined) {
				throw new MissingModelError(
					`No model was found for the table '${model}'. Define app/models/${model}.js, ` +
					`or stop records of that table reaching the store.`,
				);
			}
			return {
				class: found.class,
				create() {
					return found.class.create(owner, ...arguments);
				}
			}
		}
	}

	/**
	 * Create a new remote proxy record.
	 *
	 * @returns {Record} The remote proxy record.
	 */

	proxy(data) {
		if (this.#proxy[data.id]) {
			return this.#proxy[data.id];
		}
		return this.#proxy[data.id] = Record.initiate(data);
	}

	/**
	 * Find records in the store. This is an alias
	 * for the select method, as the Ember Router
	 * will use this method if a Route's model
	 * hook has not been defined.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the desired records.
	 */

	async find() {
		return this.select(...arguments);
	}

	/**
	 * Query records in the store. This is an alias
	 * for the search method, as the Ember Router
	 * will use this method if a Route's model
	 * hook has not been defined.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the desired records.
	 */

	async query() {
		return this.search(...arguments);
	}

	/**
	 * Inject records into the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	inject(items) {

		// The SDK resolves `select` of a record which does not exist to
		// undefined, so a dangling record link injects nothing rather than
		// throwing on `item.id` and taking down the render.

		let records = [].concat(items).filter(item => item !== null && item !== undefined).map(item => {

			try {

				// The SDK returns each record with its id as a native
				// RecordId instance; we keep it native on the model and
				// derive the table name from it. The cache stringifies
				// for its key lookups.

				let id = item.id;
				let tb = (id && id.table) ? id.table.name : String(id).split(':')[0];

				let cached = this.cached(tb, id);

				if (cached === undefined) {
					cached = this.lookup(tb).create({ id });
					this.#cache.get(tb).addObject(cached);
					cached.ingest(item);
				} else {
					cached.ingest(item);
				}

				return cached;

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else if (e instanceof MissingModelError) {

					// Skip the record rather than abandoning the whole
					// injection. A record for an unmodelled table can arrive
					// from anywhere - a live notification, a linked record of
					// an unexpected type, `$auth` - and none of those are
					// reasons to take down the caller, which is frequently an
					// event handler nothing awaits.

					console.error(`store.inject: ${e.message}`);

				} else {
					throw e;
				}

			}

		});

		return Array.isArray(items) ? records.filter(r => r !== undefined) : records[0];

	}

	/**
	 * Remove records from the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	remove(ids) {

		return [].concat(ids).map(id => {

			let model = (id && id.table) ? id.table.name : String(id).split(':')[0];

			let cached = this.cached(model, id);

			if (cached) cached.remove();

			this.unload(model, id);

		});

	}

	/**
	 * Unload records from the local record cache.
	 * The second argument can be a single id, an
	 * array of ids, or undefined. If no id is
	 * specified, then all records of the specified
	 * type will be unloaded from the cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	unload(model, id) {

		assert('The model type must be a string', typeof model === 'string');

		if (id !== undefined) {

			if (Array.isArray(id)) {
				let ids = id.map(String);
				return this.#cache.get(model).remove(v => ids.includes(String(v.id)));
			} else {
				let sid = String(id);
				return this.#cache.get(model).remove(v => String(v.id) === sid);
			}

		} else {

			return this.#cache.get(model).clear();

		}

	}

	/**
	 * Retrieve records from the local record cache.
	 * The second argument can be a single id, an
	 * array of ids, or undefined. If no id is
	 * specified, then all records of the specified
	 * type will be retrieved from the cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the cached records.
	 */

	cached(model, id) {

		assert('The model type must be a string', typeof model === 'string');

		if (id !== undefined) {

			if (Array.isArray(id)) {
				return lookupAll(this.#cache.get(model), id);
			} else {
				return lookup(this.#cache.get(model), id);
			}

		} else {

			return this.#cache.get(model);

		}

	}

	/**
	 * Select records from the remote database server
	 * or from the local record cache if cached. The
	 * second argument can be a single id, an array
	 * of ids, or undefined. If no id is specified,
	 * then all records of the specified type will be
	 * retrieved from the database. This method will
	 * update the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @param {Object} opts - Select options object.
	 * @returns {Promise} Promise object with the desired records.
	 */

	select(model, id, opts = {}) {

		assert('The model type must be a string', typeof model === 'string');

		opts = Object.assign({}, { reload: false }, opts);

		if (this.#stack[id || model] === undefined) {

			let cached = this.cached(model, id);

			switch (true) {
				case cached !== undefined && cached.length !== 0 && opts.reload !== true:
					return cached;
				case cached === undefined || cached.length === 0 || opts.reload === true:
					this.#stack[id || model] = this.remote(model, id, opts);
					return this.#stack[id || model].then(result => {
						delete this.#stack[id || model];
						return result;
					});
			}

		}

		return this.#stack[id || model];

	}

	/**
	 * Fetch records from the remote database server
	 * only, and inject the data into the cache. The
	 * second argument can be a single id, an array
	 * of ids, or undefined. If no id is specified,
	 * then all records of the specified type will be
	 * retrieved from the database. This method will
	 * update the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the desired records.
	 */

	async remote(model, id, opts = {}) {

		assert('The model type must be a string', typeof model === 'string');

		if (this.#stash[id || model] !== undefined) {
			let server = await this.#stash[id || model];
			delete this.#stash[id || model];
			return this.inject(server);
		} else {
			let server = await this.surreal.select(model, id);
			if (opts.shoebox) this.#stash[id || model] = server;
			return this.inject(server);
		}

	}

	/**
	 * Creates a record in the database and in the
	 * local cache. If the create is not successful
	 * due to an error or permissions failure, then
	 * the record will not be stored locally.
	 *
	 * @param {string} model - The model type.
	 * @param {string} id - Optional record id.
	 * @param {Object} data - The record data.
	 * @returns {Promise} Promise object with the updated record.
	 */

	async create(model, id, data) {

		assert('The model type must be a string', typeof model === 'string');

		try {

			if (arguments.length === 2) {
				[id, data] = [undefined, id];
			}

			// Built as a shadow (the third argument) - it exists only to turn
			// `data` into a payload via `.json`, and is thrown away. Without
			// the flag its constructor's field setters called `autosave()`,
			// scheduling a save of a record which has no id at all: `tb` is
			// then undefined and `thing(undefined, null)` resolves to a TABLE
			// target, so the patch was aimed at a whole table rather than at
			// any record.

			let record = this.lookup(model).create(data, true);
			let server = await this.surreal.create(model, id).content(record.json);

			// Creating without an id targets the table, and the SDK resolves a
			// table-targeted create to an array of the created records, whereas
			// targeting a record id resolves to the record itself. `inject`
			// mirrors whatever it is handed, so the return type of `create`
			// depended on whether an id was passed. It creates one record, so
			// it returns one record.

			return this.inject(Array.isArray(server) ? server[0] : server);

		} catch (e) {

			if (e instanceof DestroyedError) {
				// ignore
			} else {
				throw e;
			}

		}

	}

	/**
	 * Upserts a record in the database and in the local cache - creating it
	 * if it does not already exist. If the upsert is not successful due to
	 * an error or permissions failure, then the record will not be stored
	 * locally.
	 *
	 * @param {string} model - The model type.
	 * @param {string} id - Optional record id.
	 * @param {Object} data - The record data.
	 * @returns {Promise} Promise object with the upserted record.
	 */

	async upsert(model, id, data) {

		assert('The model type must be a string', typeof model === 'string');

		try {

			if (arguments.length === 2) {
				[id, data] = [undefined, id];
			}

			// See the matching comment on `create()` above.

			let record = this.lookup(model).create(data, true);
			let server = await this.surreal.upsert(model, id).content(record.json);

			return this.inject(Array.isArray(server) ? server[0] : server);

		} catch (e) {

			if (e instanceof DestroyedError) {
				// ignore
			} else {
				throw e;
			}

		}

	}

	/**
	 * Creates a graph edge between two records in the database and in the
	 * local cache.
	 *
	 * @param {Model|Object} from - The record the edge starts at.
	 * @param {string} edge - The edge table name.
	 * @param {Model|Object} to - The record the edge ends at.
	 * @param {Object} data - Optional data to store on the edge record.
	 * @returns {Promise} Promise object with the created edge record.
	 */

	async relate(from, edge, to, data) {

		assert('The edge table must be a string', typeof edge === 'string');

		try {

			let server = await this.surreal.relate(from, edge, to, data);

			return this.inject(server);

		} catch (e) {

			if (e instanceof DestroyedError) {
				// ignore
			} else {
				throw e;
			}

		}

	}

	/**
	 * Inserts one or more records into the database and into the local
	 * cache, in a single request.
	 *
	 * @param {string} model - The model type.
	 * @param {Object|Array} data - One or more records to insert.
	 * @returns {Promise} Promise object with the inserted record(s).
	 */

	async insert(model, data) {

		assert('The model type must be a string', typeof model === 'string');

		try {

			// Each row is shadowed through the model individually - see the
			// matching comment on `create()` above - so every row's payload
			// gets the same type serialisation a single create() would give it.

			let rows = Array.isArray(data) ? data : [data];
			let payload = rows.map(row => this.lookup(model).create(row, true).json);
			let server = await this.surreal.insert(model, Array.isArray(data) ? payload : payload[0]);

			return this.inject(server);

		} catch (e) {

			if (e instanceof DestroyedError) {
				// ignore
			} else {
				throw e;
			}

		}

	}

	/**
	 * Updates all record changes with the database.
	 * If the update is not successful due to an
	 * error or permissions failure, then the record
	 * will be rolled back.
	 *
	 * @param {Model} record - A record.
	 * @returns {Promise} Promise object with the updated record.
	 */

	async modify(record, diff) {

		assert('You must pass a record to be modified', record instanceof Model);

		try {

			let server = await this.surreal.update(record.tb, record.id).patch(diff);
			record.ingest(server);
			return record;

		} catch (e) {

			record.rollback();

			throw e;

		}

	}

	/**
	 * Updates all record changes with the database.
	 * If the update is not successful due to an
	 * error or permissions failure, then the record
	 * will be rolled back.
	 *
	 * @param {Model} record - A record.
	 * @returns {Promise} Promise object with the updated record.
	 */

	async update(record) {

		assert('You must pass a record to be updated', record instanceof Model);

		try {

			let server = await this.surreal.update(record.tb, record.id).merge(record.json);
			record.ingest(server);
			return record;

		} catch (e) {

			record.rollback();

			throw e;

		}

	}

	/**
	 * Deletes a record from the database and removes
	 * it from the local cache. If the delete is not
	 * successful due to an error or permissions
	 * failure, then the record will be rolled back.
	 *
	 * @param {Model} record - A record.
	 * @returns {Promise} Promise object with the delete record.
	 */

	async delete(record) {

		assert('You must pass a record to be deleted', record instanceof Model);

		try {

			// A DELETE that the record's own `FOR delete` permission denies is
			// not an error as far as SurrealDB is concerned - it simply
			// matches and removes nothing, and resolves the same as a real
			// delete would. Verified directly: a session lacking permission
			// gets back `undefined` here with no exception at all, so without
			// this check the `catch` below - and the rollback the docstring
			// above promises - never runs for a permissions failure, only for
			// a genuine thrown error (a network fault, say).

			let result = await this.surreal.delete(record.tb, record.id);

			if (result === undefined || result === null) {
				throw new Error(`Delete of ${record.tb}:${record.id} did not remove a record - check permissions`);
			}

			return this.unload(record.tb, record.id);

		} catch (e) {

			record.rollback();

			throw e;

		}

	}

	/**
	 * Count the total number of records within the
	 * remote database server, for the given search
	 * query paramaters. The second argument is an
	 * object containing query parameters which will
	 * be built into a count(*) SQL query. This method
	 * will return a number with the total records.
	 *
	 * @param {string} model - The model type.
	 * @param {Object} query - The query parameters.
	 * @returns {Promise} Promise object with the total number of records.
	 */

	async count(model, query = {}) {

		let { text, vars } = count(model, query);

		// The SDK resolves a query to an array of per-statement
		// result sets, and rejects on error, so there is no longer
		// a { status, result } envelope to unwrap.

		let [result = []] = await this.surreal.query(text, vars);

		return result?.[0]?.count ?? 0;

	}

	/**
	 * Search for records within the remote database
	 * server, skipping records already in the cache.
	 * The second argument is an object containing
	 * query parameters which will be built into an
	 * SQL query. This method will not update records
	 * in the local cache.
	 *
	 * @param {string} model - The model type.
	 * @param {Object} query - The query parameters.
	 * @returns {Promise} Promise object with the desired matching records.
	 */

	async search(model, query = {}) {

		// A projection narrower than `*` cannot be ingested.
		//
		// `Model#ingest` treats a field the payload does not carry as a field
		// the server no longer has, which is what makes a server-side clear
		// arrive locally at all. A row selected with an explicit field list
		// is indistinguishable from that, so ingesting one silently resets
		// every field it did not ask for to its type default - the cached
		// record is blanked while the server still holds the data, and the
		// only symptom is a detail view that empties out when some unrelated
		// list query runs.
		//
		// Selecting extra computed columns alongside `*` is fine and is what
		// callers actually want (a relevance score, say), so the requirement
		// is only that `*` is among them.

		assert(
			'A `field` projection passed to search() must include `*`, because the ' +
			'results are ingested into the record cache and a partial row would ' +
			'blank every field it omits',
			!query.field || query.field.some(f => String(f).trim() === '*'),
		);

		let result;

		let hash = hasher(model, query);

		let { text, vars } = table(model, query);

		if (this.#stash[hash] !== undefined) {
			result = await this.#stash[hash];
			delete this.#stash[hash];
		} else {
			let [rows = []] = await this.surreal.query(text, vars);
			if (query.shoebox) this.#stash[hash] = rows;
			result = rows;
		}

		let records = [].concat(result).map(item => {

			try {

				let id = item.id;

				let cached = lookup(this.#cache.get(model), id);

				if (cached === undefined) {
					cached = this.lookup(model).create({ id });
					this.#cache.get(model).addObject(cached);
					cached.ingest(item);
				} else {
					cached.ingest(item);
				}

				return cached;

			} catch (e) {

				if (e instanceof DestroyedError) {
					// ignore
				} else {
					throw e;
				}

			}

		});

		return query.limit !== 1 ? records : records[0];

	}

	/**
	 * Run a set of writes atomically inside a single SurrealDB transaction,
	 * via `surreal.transaction()`.
	 *
	 * `fn` is handed a scoped store-like object exposing `create`/`update`/
	 * `upsert`/`relate`/`insert`/`search`/`select`/`delete`, each running
	 * against the transaction. None of them
	 * touch the live record cache while the transaction is open: SurrealDB
	 * transactions read their own uncommitted writes, so a `search`/`select`
	 * inside the transaction can return a row that only exists because of
	 * this same transaction's own earlier, not-yet-committed write (a second
	 * experience entry's organisation lookup finding the organisation an
	 * earlier entry just created, say). Injecting that into the cache
	 * immediately, and then having the transaction cancel or get retried,
	 * would leave a record cached that the server never actually kept - so
	 * everything touched is buffered here and only applied, in one batch,
	 * once the transaction has actually committed.
	 *
	 * Because a conflict replays `fn` from scratch (see `surreal.transaction`),
	 * `fn` must be safe to call more than once - build fresh payloads from
	 * its own arguments rather than mutate shared or outer state, and avoid
	 * side effects outside of the scoped object it is given.
	 *
	 * A write made through `beginTransaction()`/`commit()` used to never
	 * notify a live query at all - not delayed until commit, simply never
	 * sent, even though the write itself genuinely committed (confirmed
	 * directly against a real server; fixed upstream in SurrealDB on
	 * 2026-09-13, not yet in the 3.2.3 stable release at time of writing -
	 * see `tests/integration/surreal/transaction-test.js`). That's not why
	 * this buffers, though: even with that fixed, a transaction's own reads
	 * can see its own uncommitted writes, which a live query watching from
	 * outside the transaction never will - so this client still cannot rely
	 * on a live-query notification alone to know what it just wrote.
	 *
	 * Gotcha for callers: pass a row's `.id`, never the row itself, when
	 * pointing a later `create` at something created or found earlier in the
	 * same transaction (an experience row's `organisation`, say). A
	 * record-link field's setter (`classes/field/record.js`) injects a plain
	 * object it is handed straight into the live cache to resolve the link -
	 * which is exactly the premature, pre-commit injection this method
	 * exists to prevent. A `RecordId` (a row's `.id`) is handled without
	 * touching the cache at all.
	 *
	 * @param {Function} fn - Callback receiving a transaction-scoped store.
	 * @returns {Promise} Resolves with whatever `fn` returns, once committed.
	 */

	async transaction(fn) {

		let { result, touched, removed } = await this.surreal.transaction(async (surreal) => {

			// Declared fresh per attempt - a conflict discards this attempt's
			// transaction entirely, so anything it touched must be discarded
			// with it rather than carried over into the retry's own buffer.

			let touched = []; // raw rows from every create/update/upsert/relate/insert/select/search done inside
			let removed = []; // [tb, id] pairs deleted inside

			// Shadows `data` through the model to get its serialised JSON
			// payload - the same construction `create()`/`upsert()` use
			// outside a transaction (see the comment on `create()` above),
			// so type formatting (dates, etc.) matches either way.

			let payload = (model, data) => this.lookup(model).create(data, true).json;

			let scoped = {

				// Arrow function, so `this` stays the outer `Store` (for
				// `payload`'s `this.lookup`) - which rules out the usual
				// `arguments.length === 2` check for the shorthand
				// `create(model, data)` call used below, since an arrow
				// function has no own `arguments`. Checking `data ===
				// undefined` instead is equivalent: with only two arguments
				// supplied, the third parameter is always undefined
				// regardless of what was passed as the second.
				create: async (model, id, data) => {

					assert('The model type must be a string', typeof model === 'string');

					if (data === undefined) {
						[id, data] = [undefined, id];
					}

					let server = await surreal.create(model, id).content(payload(model, data));
					let row = Array.isArray(server) ? server[0] : server;

					touched.push(row);

					return row;

				},

				// Full-content replace of an existing (or table-wide) target -
				// unlike `create`, `id` is required, since updating a record
				// you have not identified is rarely what's wanted.
				update: async (model, id, data) => {

					assert('The model type must be a string', typeof model === 'string');

					let server = await surreal.update(model, id).content(payload(model, data));
					let row = Array.isArray(server) ? server[0] : server;

					touched.push(row);

					return row;

				},

				upsert: async (model, id, data) => {

					assert('The model type must be a string', typeof model === 'string');

					if (data === undefined) {
						[id, data] = [undefined, id];
					}

					let server = await surreal.upsert(model, id).content(payload(model, data));
					let row = Array.isArray(server) ? server[0] : server;

					touched.push(row);

					return row;

				},

				relate: async (from, edge, to, data) => {

					assert('The edge table must be a string', typeof edge === 'string');

					let row = await surreal.relate(from, edge, to, data);

					touched.push(row);

					return row;

				},

				insert: async (model, data) => {

					assert('The model type must be a string', typeof model === 'string');

					let rows = Array.isArray(data) ? data : [data];
					let json = rows.map(row => payload(model, row));
					let server = await surreal.insert(model, Array.isArray(data) ? json : json[0]);
					let list = [].concat(server);

					touched.push(...list);

					return server;

				},

				search: async (model, query = {}) => {

					assert('The model type must be a string', typeof model === 'string');

					// See the matching assertion in `search()` above - a partial
					// row blanks every field it omits once ingested.

					assert(
						'A `field` projection passed to search() must include `*`, because the ' +
						'results are ingested into the record cache and a partial row would ' +
						'blank every field it omits',
						!query.field || query.field.some(f => String(f).trim() === '*'),
					);

					let { text, vars } = table(model, query);
					let [rows = []] = await surreal.query(text, vars);

					touched.push(...rows);

					return query.limit !== 1 ? rows : rows[0];

				},

				select: async (model, id) => {

					assert('The model type must be a string', typeof model === 'string');

					let row = await surreal.select(model, id);

					if (row) touched.push(row);

					return row;

				},

				delete: async (record) => {

					assert('You must pass a record to be deleted', record instanceof Model);

					await surreal.delete(record.tb, record.id);

					removed.push([record.tb, record.id]);

				},

			};

			let result = await fn(scoped);

			return { result, touched, removed };

		});

		for (let row of touched) this.inject(row);
		for (let [tb, id] of removed) this.unload(tb, id);

		return result;

	}

}
