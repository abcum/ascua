import Ember from 'ember';
import context from '@ascua/context';
import { setOwner } from '@ember/application';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { defer } from '@ascua/queue';
import Patch from '../dmp/patch';
import Diff from '../dmp/diff';
import json from '../../utils/json';

export const RECORD = Symbol('RECORD');
export const LOADED = Symbol('LOADED');
export const LOADING = Symbol('LOADING');
export const DELETED = Symbol('DELETED');

export default class Model {
  // ------------------------------
  // Static methods
  // ------------------------------

  static create(owner, data, shadow) {
    return new this(owner, data, shadow);
  }

  // ------------------------------
  // Instance properties
  // ------------------------------

  @inject surreal;

  @inject store;

  #id = null;

  #fake = false;

  // Current context object
  #ctx = undefined;

  // Context cancel function
  #cancel = undefined;

  // Shadow local record copy
  #shadow = undefined;

  // Last state of sent data
  #client = undefined;

  // Last state of received data
  #server = undefined;

  // The current underlying record state
  [RECORD] = {
    @tracked data: {},
    @tracked state: LOADED,
  };

  // The `tb` property can be used
  // to retrieve the actual table
  // that this record belongs to.

  get tb() {
    return this.#id.split(':')[0];
  }

  // The `id` property can be used
  // to retrieve the actual thing
  // id for this Surreal record.

  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
  }

  // The exists property allows us
  // to detect whether the record
  // exists or has been deleted.

  get exists() {
    return this[RECORD].state !== DELETED;
  }

  // The `json` property returns a
  // JSON representation copy of the
  // record's current data snapshot.

  get json() {
    return JSON.parse(JSON.stringify(this));
  }

  // When formatted as a string, the
  // record will output the record
  // id, with both table and id.

  toString() {
    return this.#id;
  }

  // When formatted as a JSON string,
  // the record's underlying data will
  // be used for serlialization.

  toJSON() {
    return Object.assign(this[RECORD].data, {
      id: this.id,
    });
  }

  get _full() {
    return json.full(this);
  }

  get _some() {
    return json.some(this);
  }

  // ------------------------------
  // Instance methods
  // ------------------------------

  /**
   * Finalizes the record setup.
   *
   * @returns {undefined} Does not return anything.
   */

  constructor(owner, data, shadow) {
    setOwner(this, owner);
    for (const key in data) {
      this[key] = data[key];
    }
    this.#fake = shadow;
    this.#server = this._some;
    this.#client = this._some;
  }

  /**
   * Autosaves the record to the database.
   *
   * @returns {Promise} Promise object with the saved record.
   */

  autosave() {
    // Ignore
  }

  /**
   * Mark the record as deleted o the remote store.
   *
   * @returns {undefined} Does not return anything.
   */

  remove() {
    this[RECORD].state = DELETED;
  }

  /**
   * Update the record in the database.
   *
   * @returns {Promise} Promise object with the updated record.
   */

  async update() {
    if (this.#cancel) this.#cancel();
    [this.#ctx, this.#cancel] = context.withCancel();
    return this._update.queue();
  }

  /**
   * Delete the record in the database.
   *
   * @returns {Promise} Promise object with the deleted record.
   */

  async delete() {
    if (this.#cancel) this.#cancel();
    [this.#ctx, this.#cancel] = context.withCancel();
    return this._delete.queue();
  }

  /**
   * Save the record to the database.
   *
   * @returns {Promise} Promise object with the saved record.
   */

  async save() {
    if (this.#cancel) this.#cancel();
    [this.#ctx, this.#cancel] = context.withCancel();
    try {
      await this.#ctx.delay(500);
      return this._modify.queue();
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Rollback the record without saving.
   *
   * @returns {undefined} Does not return anything.
   */

  rollback() {
    // Set state to LOADING
    this[RECORD].state = LOADING;

    // Get the local record state
    let local = this.#shadow._full;

    // Apply server side changes to local record
    for (const key in local) {
      this[key] = local[key];
    }

    // Store the current client<->server state
    this.#client = this.#server = this.#shadow._some;

    // Set state to LOADED
    this[RECORD].state = LOADED;
  }

  /**
   * Initiates a record modification from the
   * server based on the modified record data.
   *
   * @returns {undefined} Does not return anything.
   */

  ingest(data) {
    // Set state to LOADING
    this[RECORD].state = LOADING;

    // Create a new shadow record for the data
    this.#shadow = this.store.lookup(this.tb).create(data);

    // Calculate changes while data was in flight
    let changes = new Diff(this.#client, this._some).output();

    // Merge in-flight changes with server changes
    let current = new Patch(this.#shadow._full, changes).output();

    // Apply server side changes to local record
    for (const key in current) {
      this[key] = current[key];
    }

    // Store the current client<->server state
    this.#client = this.#server = this.#shadow._some;

    // Set state to LOADED
    this[RECORD].state = LOADED;

    // Save any changes
    if (changes.length) {
      this.autosave();
    }
  }

  /**
   * Initiates a record update with the database.
   *
   * @returns {Promise} Promise object with the updated record.
   */

  @defer async _modify() {
    if (this.#fake) return;
    try {
      let diff = new Diff(this.#client, this._some).output();
      if (diff.length) {
        this[RECORD].state = LOADING;
        this.#client = this._some;
        return this.store.modify(this, diff);
      }
    } catch (e) {
      // Ignore
    } finally {
      this[RECORD].state = LOADED;
    }
  }

  /**
   * Initiates a record update with the database.
   *
   * @returns {Promise} Promise object with the updated record.
   */

  @defer async _update() {
    if (this.#fake) return;
    try {
      this[RECORD].state = LOADING;
      this.#client = this._some;
      return this.store.update(this);
    } catch (e) {
      // Ignore
    } finally {
      this[RECORD].state = LOADED;
    }
  }

  /**
   * Initiates a record delete with the database.
   *
   * @returns {Promise} Promise object with the deleted record.
   */

  @defer async _delete() {
    if (this.#fake) return;
    try {
      return this.store.delete(this);
    } catch (e) {
      // Ignore
    } finally {
      this[RECORD].state = DELETED;
    }
  }
}
