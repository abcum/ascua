import Ember from 'ember';
import { setOwner } from '@ember/application';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import meta from '../meta';
import json from '../../utils/json';
import { RECORD } from '../model';

export default class Field {
  // ------------------------------
  // Static methods
  // ------------------------------

  static create(owner, data, shadow) {
    return new this(owner, data, shadow);
  }

  // ------------------------------
  // Instance properties
  // ------------------------------

  @inject store;

  #parent = undefined;

  // The current underlying record state
  [RECORD] = {
    @tracked data: {},
  };

  // The `parent` property can be used
  // to retrieve the underlying parent
  // model that owns this record.

  get parent() {
    return this.#parent;
  }

  set parent(value) {
    this.#parent = value;
  }

  // When formatted as a JSON string,
  // the record's underlying data will
  // be used for serlialization.

  toJSON() {
    return this[RECORD].data;
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
  }

  /**
   * Save the record to the database.
   * @returns {Promise} Promise object with the saved record.
   */

  save() {
    return this.#parent && this.#parent.save();
  }

  /**
   * Autosave the record to the database.
   * @returns {Promise} Promise object with the saved record.
   */

  autosave() {
    return this.#parent && this.#parent.autosave();
  }
}
