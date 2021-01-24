import Service from '@ember/service';
import Cache from '../classes/cache';
import { inject } from '@ember/service';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import Model from '@ascua/surreal/model';
import count from "../builders/count";
import table from "../builders/table";
import hasher from "../builders/hasher";
import Record from '../classes/types/record';
import { DestroyedError } from '../errors';

export default class Store extends Service {

	@inject surreal;

	#cache = new Cache();

	#proxy = new Object();

	#stack = new Object();

	#stash = new Object();

	get fastboot() {
		let owner = getOwner(this);
		return owner.lookup('service:fastboot');
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
		super.willDestroy();
		this.reset();
	}

	/**
	 * Reset the store.
	 *
	 * @returns {undefined} Does not return anything.
	 */

	reset() {
		this.#cache.clear();
		for (let k in this.#proxy) {
			delete this.#proxy[k];
		}
		for (let k in this.#stack) {
			delete this.#stack[k];
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
	 * Remove records from the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	async remove(ids) {

		return [].concat(ids).map(async id => {
			return await this.unload(id.split(':')[0], id);
		});

	}

	/**
	 * Inject records into the local record cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	async inject(items) {

		let records = [].concat(items).map(async item => {

			try {

				let cached = await this.cached(item.meta.tb, item.id);

				if (cached === undefined) {
					cached = this.lookup(item.meta.tb).create(item);
					this.#cache.get(item.meta.tb).addObject(cached);
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

		switch ( Array.isArray(items) ) {
		case true:
			return await Promise.all(records);
		case false:
			return await records[0];
		}

	}

	/**
	 * Remove records from the local record cache.
	 * The second argument can be a single id, an
	 * array of ids, or undefined. If no id is
	 * specified, then all records of the specified
	 * type will be removed from the cache.
	 *
	 * @param {string} model - The model type.
	 * @param {undefined|string|Array} id - A specific record id.
	 * @returns {Promise} Promise object with the removed records.
	 */

	async unload(model, id) {

		assert('The model type must be a string', typeof model === 'string');

		if (id !== undefined) {

			if (Array.isArray(id)) {
				return this.#cache.get(model).remove( v => id.includes(v) );
			} else {
				return this.#cache.get(model).removeBy('id', id);
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

	async cached(model, id, opts) {

		assert('The model type must be a string', typeof model === 'string');

		if (id !== undefined) {

			if (Array.isArray(id)) {
				return this.#cache.get(model).filter( v => id.includes(v) );
			} else {
				return this.#cache.get(model).findBy('id', id);
			}

		} else {

			return this.#cache.get(model);

		}

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

	async remote(model, id, opts) {

		assert('The model type must be a string', typeof model === 'string');

		if (this.#stash[id||model] !== undefined) {
			let server = await this.#stash[id||model];
			delete this.#stash[id||model];
			return this.inject(server);
		} else {
			let server = await this.surreal.select(model, id);
			if (opts.shoebox) this.#stash[id||model] = server;
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

			let record = this.lookup(model).create(data);
			let server = await this.surreal.create(model, id, record.data);
			await this.inject(server);
			return this.cached(model, server.id);

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

			let server = await this.surreal.modify(record.tb, record.id, diff);
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

			let server = await this.surreal.change(record.tb, record.id, record.json);
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

			await this.surreal.delete(record.tb, record.id);
			return this.unload(record.tb, record.id);

		} catch (e) {

			record.rollback();

			throw e;

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

	async select(model, id, opts) {

		assert('The model type must be a string', typeof model === 'string');

		opts = Object.assign({}, { reload: false }, opts);

		if (this.#stack[id||model] === undefined) {

			this.#stack[id||model] = this.cached(model, id).then(cached => {

				switch (true) {
				case cached === undefined || cached.length === 0 || opts.reload === true:
					return this.remote(model, id, opts).then(result => {
						delete this.#stack[id||model];
						return result;
					});
				case cached !== undefined && cached.length !== 0 && opts.reload !== true:
					return this.cached(model, id, opts).then(result => {
						delete this.#stack[id||model];
						return result;
					});
				}

			});

		}

		return await this.#stack[id||model];

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

	async count(model, query) {

		let { text, vars } = count(model, query);

		let [json] = await this.surreal.query(text, vars);

		const { status, detail, result = [] } = json;

		if (status !== 'OK') throw new Error(detail);

		return result && result[0] && result[0].count || 0;

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

	async search(model, query) {

		let result;

		let hash = hasher(model, query);

		let { text, vars } = table(model, query);

		if (this.#stash[hash] !== undefined) {
			result = await this.#stash[hash];
			delete this.#stash[hash];
		} else {
			let [json] = await this.surreal.query(text, vars);
			if (json.status !== 'OK') throw new Error(json.detail);
			if (query.shoebox) this.#stash[hash] = json.result || [];
			result = json.result || [];
		}

		let records = [].concat(result).map(item => {

			try {

				let cached = this.#cache.get(model).findBy('id', item.id);

				if (cached === undefined) {
					cached = this.lookup(model).create(item);
					this.#cache.get(model).addObject(cached);
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

		return query.limit === 1 ? records[0] : records;

	}

}
