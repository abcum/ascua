import Ember from 'ember';
import context from '@ascua/context';
import { setOwner } from '@ember/application';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { defer } from '@ascua/queue';
import Patch from '../dmp/patch';
import Diff from '../dmp/diff';
import meta from '../meta';
import json from '../../utils/json';

export const RECORD = Symbol("RECORD");
export const LOADED = Symbol("LOADED");
export const LOADING = Symbol("LOADING");
export const DELETED = Symbol("DELETED");

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

	@service surreal;

	@service store;

	#id = null;

	#fake = false;

	// Underlying meta data
	#meta = undefined;

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
		// The error from the most recent save/update/delete attempt, or
		// `undefined` if the last attempt (if any) succeeded. Cleared as a
		// new attempt starts — see the note on `bigdata`'s `failure` field
		// for why: without this, a record that failed once stayed failed,
		// since nothing else ever wrote it back.
		@tracked error: undefined,
	}

	// The `tb` property can be used
	// to retrieve the actual table
	// that this record belongs to.

	get tb() {
		if (this.#id == null) return undefined;
		return this.#id.table ? this.#id.table.name : String(this.#id).split(':')[0];
	}

	// The `id` property can be used
	// to retrieve the actual thing
	// id for this Surreal record.

	get id() {
		return this.#id;
	}

	set id(value) {
		// Ids are kept native (RecordId); they are only stringified at the
		// edges that need it (cache keys, `tb`, templates via toString).
		this.#id = value;
	}

	// The `meta` property stores the
	// raw table and id of the record
	// which is generated on the server.

	get meta() {

		if (this.#meta !== undefined) return this.#meta;

		// The 0.3 server sent this sidecar on every record. SurrealDB 3.x does
		// not, so it is derived from the record id instead — a great deal of
		// application code reads `.meta.tb` and `.meta.id`, and an absent
		// sidecar throws in JS while silently rendering nothing in a template.
		//
		// Synthesising it cannot affect what is written: utils/json.js builds
		// its snapshots from `meta.all(object)`, which lists only fields
		// registered by the field decorators, so `meta` can never enter a diff
		// or an UPSERT payload.

		if (this.#id == null) return undefined;

		return {
			tb: this.tb,
			id: this.#id.id ?? String(this.#id).split(':').slice(1).join(':'),
		};

	}

	set meta(value) {
		this.#meta = value;
	}

	// The exists property allows us
	// to detect whether the record
	// exists or has been deleted.

	get exists() {
		return this[RECORD].state !== DELETED;
	}

	// The error from the most recent save/update/delete attempt. `undefined`
	// once an attempt has succeeded, or if none has been made. A failed
	// attempt is rolled back — the record's fields are reverted to the last
	// server-confirmed state, same as a normal `ingest` — so this is the
	// only signal that the revert happened; nothing about `[RECORD].state`
	// tells the two apart.

	get error() {
		return this[RECORD].error;
	}

	// The `json` property returns a
	// JSON representation copy of the
	// record's current data snapshot.

	get json() {
		return this._full;
	}

	// When formatted as a string, the
	// record will output the record
	// id, with both table and id.

	toString() {
		// Always a string — see the same note on classes/types/record.js.
		return this.#id == null ? '' : String(this.#id);
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

		// `#cancel` only stops a save/update still inside its debounce delay
		// (see `save()` below) - it cannot stop one that has already left that
		// delay and is in flight to the server, because `_modify`/`_update`
		// are independent `@defer` queues with no knowledge of `_delete`.
		// Waiting for them to settle here guarantees this DELETE is always
		// the last write SurrealDB sees for this record, so a MERGE that was
		// already in flight can never land after it - on a SurrealDB version
		// where UPDATE upserts a missing id (true before 2.0.0), a save that
		// arrived after the row was gone would otherwise silently recreate
		// it, near-empty, with only whatever fields that one diff carried.

		await this._modify.settle();
		await this._update.settle();

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
			return await this._modify.queue();
		} catch (e) {

			// A superseded save is expected and silent: the next field edit
			// calls `this.#cancel()` above, on THIS context, before it has a
			// chance to reject anything — there is no parent to cancel it and
			// no reason available to attach, so `@ascua/context`'s `delay`
			// rejects this one with `undefined`, not an Error. Verified
			// directly against `@ascua/context`: `cancel()` called with no
			// argument resolves `cancelled` with `undefined`, which `delay`
			// then rejects with, unchanged.
			//
			// A `cancError`-shaped rejection is handled too, in case a parent
			// context ever cancels this one instead — `@ascua/context`
			// reserves that shape for exactly that, though nothing reaches
			// this method as a child of another context today.
			//
			// Anything else is a genuine failure and must reach the caller,
			// same as `.update()` and `.delete()` already do; swallowing it
			// here would hide it from the one place — `autosave.js` — that has
			// to decide whether an unattended failure is safe to leave
			// unhandled.

			if (e === undefined) return;
			if (e.message === 'context cancelled') return;

			throw e;

		}
	}

	/**
	 * Rollback the record without saving.
	 *
	 * @returns {undefined} Does not return anything.
	 */

	rollback() {

		// A record which has never been ingested has no server-confirmed
		// state to roll back to, and `#shadow` is still undefined. Reading
		// `._full` off it threw a TypeError from inside `store.modify`'s
		// `catch`, which then REPLACED the server's own error - so the real
		// reason a save failed was destroyed and never reached the caller.
		//
		// Worse, the throw happened after `state` had been set to LOADING and
		// before it could be set back, leaving the record stuck there
		// permanently. `@autosave` only fires while a record is LOADED (see
		// decorators/autosave.js), so from that point on the record silently
		// stopped saving altogether: every later edit showed up in the UI and
		// none of it was ever sent.

		if (this.#shadow === undefined) {
			this[RECORD].state = LOADED;
			return;
		}

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

		// Create a new shadow record for the data.
		//
		// Created as a shadow (the third argument) so it is inert. Without
		// that flag it is an ordinary record: its constructor runs every
		// field setter, each of which calls `autosave()`, so every ingest -
		// one per record per load, per search result, per live notification -
		// queued a save of a throwaway copy. Those saves were no-ops only
		// because the copy's client state is snapshotted immediately
		// afterwards, leaving nothing to diff; anything that perturbed that
		// left a phantom write aimed at the real record's id.

		this.#shadow = this.store.lookup(this.tb).create(data, true);

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

		// A confirmed delete already won the race in `delete()` (see its own
		// note) for anything still in flight when it was called; this covers
		// the remaining case, a save queued *after* the delete has already
		// succeeded - e.g. a field mutated by code that still held a
		// reference to this record. Without this, `store.modify` would MERGE
		// straight back into a now-missing id, which upserts it on a
		// SurrealDB version where UPDATE creates a missing record (true
		// before 2.0.0).

		if (this[RECORD].state === DELETED) return;

		// Computing the diff is kept OUTSIDE the failure-recording try below,
		// and failing to compute one is still treated as "nothing to save",
		// not a save failure — restoring the original behaviour here, which
		// this method's first pass at awaiting the store call accidentally
		// changed by moving the diff out of the one try/catch that existed.
		//
		// That accidental change was reachable: some record shapes make
		// `Diff`'s structural walk throw (see `classes/dmp/diff.js`), and with
		// the diff step no longer guarded, that exception propagated as a
		// genuine save failure — recorded, logged by `autosave.js`, on every
		// affected record, on every list load, for a condition that was never
		// a server round-trip and never should have looked like one.

		let diff;

		try {
			diff = new Diff(this.#client, this._some).output();
		} catch (e) {
			return;
		}

		if (!diff.length) return;

		this[RECORD].state = LOADING;
		this[RECORD].error = undefined;
		this.#client = this._some;

		// Awaited rather than returned bare. `store.modify` calls `ingest()` on
		// success or `rollback()` on failure before its own promise settles, and
		// both already set `[RECORD].state` correctly — so this no longer needs
		// a `finally` to do it again, and doing it here as well as an unawaited
		// bare `return` used to set state to LOADED synchronously, before the
		// request had even reached the server.
		//
		// The `catch` here is what makes a genuine failure visible at all: an
		// unawaited `return this.store.modify(...)` chains its rejection onto
		// this method's own returned promise without this local `catch` ever
		// running, so recording the error onto the record was not possible —
		// only rethrowing was, and that reached the caller of `.save()`, which
		// nothing awaits (see `autosave.js`, where it is finally handled).

		try {
			return await this.store.modify(this, diff);
		} catch (e) {
			this[RECORD].error = e;
			throw e;
		}

	}

	/**
	 * Initiates a record update with the database.
	 *
	 * @returns {Promise} Promise object with the updated record.
	 */

	@defer async _update() {
		if (this.#fake) return;

		// See the matching guard in `_modify` above.
		if (this[RECORD].state === DELETED) return;

		this[RECORD].state = LOADING;
		this[RECORD].error = undefined;
		this.#client = this._some;

		// See the note in `_modify` above: awaited so `ingest()`/`rollback()`
		// inside `store.update` run and settle state before this resolves, and
		// so the failure can be recorded rather than silently rethrown into a
		// promise nothing awaits.

		try {
			return await this.store.update(this);
		} catch (e) {
			this[RECORD].error = e;
			throw e;
		}

	}

	/**
	 * Initiates a record delete with the database.
	 *
	 * @returns {Promise} Promise object with the deleted record.
	 */

	@defer async _delete() {
		if (this.#fake) return;

		this[RECORD].error = undefined;

		// `state = DELETED` used to run in a `finally`, unconditionally — which
		// marked the record deleted locally even when the server delete failed
		// and `store.delete`'s own `catch` had already called `rollback()` to
		// put it back. A denied or failed delete left the record gone from the
		// UI while it still existed on the server. It is now only set once the
		// delete has actually succeeded; the failure path leaves state exactly
		// where `rollback()` put it.

		try {
			let result = await this.store.delete(this);
			this[RECORD].state = DELETED;
			return result;
		} catch (e) {
			this[RECORD].error = e;
			throw e;
		}

	}

}
