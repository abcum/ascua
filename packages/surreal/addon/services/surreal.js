import Service from '@ascua/service/evented';
import Storage from '@ascua/storage';
import config from '@ascua/config';
import unid from '../utils/unid';
import thing from '../utils/thing';
import { Surreal as Database, Table, isRetryableConflict, raw } from 'surrealdb';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { assert } from '@ember/debug';
import { cache } from '@ascua/decorators';
import { timeout } from '@ascua/promise';
import JWT from '../utils/jwt';

const defaults = {
	id: unid(),
	ns: undefined,
	db: undefined,
	NS: undefined,
	DB: undefined,
	url: 'wss://cloud.surrealdb.com',
};

// Reconnection policy.
//
// Passing `reconnect: true` takes the SDK's own defaults, which are wrong for
// a long-lived desktop app: five attempts, starting at a 1s delay and
// doubling, so the connection is abandoned permanently after roughly a minute
// offline. A closed laptop lid, a VPN reconnect or a server restart therefore
// left the app running against a socket that would never come back — and
// because nothing in the UI depends on the socket being up, it went on
// accepting edits, showing them as saved, and persisting none of them until
// the whole app was restarted.
//
// So: never give up, and come back fast. The SDK waits
// `retryDelay * retryDelayMultiplier ** attempt`, capped at `retryDelayMax`,
// which with these values is ~375ms for the first retry and reaches the 10s
// ceiling after about ten — quick enough that a brief blip is invisible,
// gentle enough that a server which is down for an hour is not hammered.
//
// Override any of it with `surreal.reconnect` in the environment config.

const reconnection = {
	enabled: true,
	attempts: -1,
	retryDelay: 250,
	retryDelayMax: 10000,
	retryDelayMultiplier: 1.5,
	retryDelayJitter: 0.1,
};

// Retry policy for transaction conflicts.
//
// A write that lands on the same record as another concurrent write - two
// of a contact's `experience` rows created together, say, each triggering
// a schema `notify` event that bumps that contact's `times.updated` - can
// be rejected by SurrealDB's optimistic concurrency control with a
// "Transaction conflict: Resource busy" error. The SDK can re-send a
// conflicting write with backoff instead of surfacing that to the caller,
// which is what `.retry()` on `create()`, `update()`, `change()`,
// `modify()` and `delete()` below opts into, using this policy as the
// default. Overrides the SDK's own `enabled: false`, since here it is the
// expected way of handling the conflict rather than something each caller
// opts into individually.
//
// Override any of it with `surreal.retry` in the environment config.

const retry = {
	enabled: true,
	attempts: 5,
	retryDelay: 100,
	retryDelayMax: 2000,
	retryDelayMultiplier: 2,
	retryDelayJitter: 0.1,
};

// How many times to try authenticating with the stored token before treating
// it as genuinely invalid, and how long to wait between tries.
//
// `#attempt()` runs on every `connected` event, including the reconnections
// the policy above now retries indefinitely - so a socket recovering from a
// blip, a VPN switch or a permission query still queued from before the drop
// can make a single `authenticate()` call fail for reasons that have nothing
// to do with the token itself. Treating that one failure as an invalidation
// forces the user back to the sign-in screen despite holding a perfectly good
// token - which on Hire Insight also silently signs the user out of LinkedIn,
// since app code treats reaching the sign-in screen as a reason to do that.
// Trying a few times first gives a settling connection a chance to catch up
// before we give up on the token.

const attempts = {
	count: 3,
	delay: 500,
};

// Builds the create/update/upsert/relate/insert/delete/select/query surface
// for a given queryable - the live connection, or an open transaction (both
// expose the same shape via the SDK's shared `SurrealQueryable` base).
//
// Building the direct service's methods AND the transaction-scoped object
// from this one factory, rather than hand-writing two copies, is what keeps
// them from drifting apart - there is exactly one definition of what each
// verb means, used against two different targets.
//
// `create`/`update`/`upsert` are returned unresolved and chainable, mirroring
// the SDK itself rather than inventing our own verbs for it: the caller
// finishes with `.content(data)`, `.merge(data)`, `.replace(data)` or
// `.patch(data)`. Only `update`/`upsert` get `.replace()` from the SDK -
// its only difference from `.content()` is that it makes SurrealDB error on
// a READONLY-field mismatch instead of `.content()`'s silent,
// existing-value-preserving behaviour, which requires an existing record to
// mean anything; `create` has none, so the SDK gives it no `.replace()`
// either. `relate`/`insert` take their data directly, matching the SDK's own
// (non-chainable) shape for those two.
//
// `retry` applies the single-write retry policy to every mutating verb. It
// is true for the direct service and false inside a transaction, where a
// conflict aborts the whole transaction and only replaying it from scratch
// (see `transaction()` below) is meaningful - retrying one statement out of
// it is not.

function queryable(db, retry) {

	let r = retry ? (p => p.retry()) : (p => p);

	return {
		query: (...args) => db.query(...args),
		select: (tb, id) => db.select(thing(tb, id)),
		create: (tb, id) => r(db.create(thing(tb, id))),
		update: (tb, id) => r(db.update(thing(tb, id))),
		upsert: (tb, id) => r(db.upsert(thing(tb, id))),
		relate: (from, edge, to, data) => r(db.relate(thing(undefined, from), new Table(edge), thing(undefined, to), data)),
		insert: (tb, data) => r(db.insert(new Table(tb), data)),
		delete: (tb, id) => r(db.delete(thing(tb, id))),
	};

}

export default class Surreal extends Service {

	@service store;

	// The localStorage proxy class
	// which enables us to write to
	// localStorage if it is enabled.

	#ls = new Storage();

	// The underlying instance of
	// the official SurrealDB SDK
	// which connects to the server.

	#db = new Database();

	// The direct-service verb surface, built once against `#db` with the
	// single-write retry policy applied - see `queryable()` above.

	#verbs = queryable(this.#db, true);

	// The full configuration info for
	// SurrealDB, including NS, DB,
	// and custom endpoint options.

	#config = undefined;

	// The set of unsubscribe functions
	// for the SDK connection lifecycle
	// event listeners, cleared on destroy.

	#listeners = [];

	// The set of active live query
	// subscriptions.
	//
	// Held by identity rather than keyed by `sub.id`: a managed subscription
	// re-registers itself under a NEW id every time the connection is
	// re-established, so an id captured at subscribe time stops matching
	// after the first reconnection - `kill()` then silently failed to find
	// the subscription, leaving it running and leaking its entry here.

	#live = new Set();

	// Bumped on every `#attempt()` call, so a retry left over from a
	// superseded connect cycle (the socket dropped and reconnected again
	// while it was still waiting) can tell it is stale and back off quietly
	// instead of racing the newer attempt to set the service's state.

	#attemptId = 0;

	// The resolved reconnection policy, exposed so it can be inspected.

	#reconnect = undefined;

	// The resolved retry policy, exposed so it can be inspected.

	#retry = undefined;

	// The contents of the token
	// used for authenticating with
	// the Surreal database;

	@tracked token = null;

	// Whether we can proceed to
	// transition to authenticated
	// and unauthenticated routes.

	@tracked opened = false;

	// Whether there has been an
	// attempt to authenticate the
	// connection with the database.

	@tracked attempted = false;

	// Whether the connection to the
	// Surreal database has been
	// invalidated with no token.

	@tracked invalidated = false;

	// Whether the connection to the
	// Surreal database has been
	// authenticated with a token.

	@tracked authenticated = false;

	// Add a property for the parsed
	// authentication token, so we
	// can access it when needed.

	@cache get jwt() {
		return JWT(this.token);
	}

	// The reconnection policy actually in force, after the environment
	// config has been merged over the defaults.

	get reconnect() {
		return this.#reconnect;
	}

	// The retry policy actually in force, after the environment
	// config has been merged over the defaults.

	get retry() {
		return this.#retry;
	}

	// The live query subscriptions currently held open.

	get subscriptions() {
		return [...this.#live];
	}

	// Setup the Surreal service,
	// listening for token changes
	// and connecting to the DB.

	constructor() {

		super(...arguments);

		// Listen for changes to the local storage
		// authentication key, and reauthenticate
		// if the token changes from another tab.
		//
		// The token comparison is what stops this ping-ponging between tabs
		// forever. A `storage` event fires in every *other* tab, and
		// authenticate() writes the token back to local storage
		// unconditionally, so without the guard two open tabs feed each other:
		// A writes, B hears it and authenticates, B writes, A hears it and
		// authenticates, and round it goes. Each lap is an `authenticate` RPC
		// on the socket. Measured before this guard: 102,544 authenticate
		// messages sent during one page load with two tabs open, which
		// saturates the connection so ordinary queries never get a response,
		// and pins a CPU core server-side. One tab alone never shows it.

		if (window && window.addEventListener) {
			window.addEventListener('storage', e => {
				if (e.key === 'surreal' && e.newValue !== this.token) {
					this.authenticate(e.newValue);
				}
			});
		}

		// Get the token so that it populates
		// the jwt getter value, so that the
		// token contents can be accessed.

		this.token = this.#ls.get('surreal');

		// When the connection is closed we
		// change the relevant properties
		// stop live queries, and trigger.

		this.#listeners.push(this.#db.subscribe('disconnected', () => {
			this.opened = false;
			this.attempted = false;
			this.invalidated = false;
			this.authenticated = false;
			this.emit('closed');
		}));

		// When the connection drops but is going
		// to be retried, the SDK reports it as
		// `reconnecting` rather than `disconnected`.
		//
		// This has to be handled or the service's own state is a lie. The SDK
		// publishes `disconnected` ONLY once it has stopped trying - when the
		// socket is closed deliberately, or when the retry budget is spent -
		// and publishes `reconnecting` for every ordinary drop in between. So
		// a service listening only for `disconnected` went on reporting
		// `opened === true` throughout an outage, and never emitted `closed`.
		// Everything downstream that gates on those (route transitions, any
		// offline indicator) therefore believed the connection was healthy
		// while nothing could reach the server. With an unlimited retry budget
		// - see `reconnection` above - `disconnected` now essentially never
		// fires on its own, which would have made that permanent.

		this.#listeners.push(this.#db.subscribe('reconnecting', () => {
			this.opened = false;
			this.attempted = false;
			this.invalidated = false;
			this.authenticated = false;
			this.emit('closed');
		}));

		// When the connection is opened we
		// update the relevant properties and
		// then attempt to authenticate below.

		this.#listeners.push(this.#db.subscribe('connected', () => {
			this.opened = true;
			this.attempted = false;
			this.invalidated = false;
			this.authenticated = false;
			this.emit('opened');
			this.#attempt();
		}));

		// Get the configuration options
		// which have been specified in the
		// app environment config file.

		this.#config = Object.assign({}, defaults, config.surreal);

		assert(
			'Set the `surreal.ns` property in your environment config as a string',
			this.#config.ns !== undefined || this.#config.NS !== undefined,
		);

		assert(
			'Set the `surreal.db` property in your environment config as a string',
			this.#config.db !== undefined || this.#config.DB !== undefined,
		);

		// Build the websocket endpoint from the
		// configured uri, appending the /rpc path
		// which the SurrealDB server listens on.

		if (this.#config.uri) this.#config.url = `${this.#config.uri}/rpc`;

		// Open the websocket for the first time.
		// The SDK will automatically attempt to
		// reconnect on failure when `reconnect` is set.

		this.#reconnect = Object.assign({}, reconnection, this.#config.reconnect);
		this.#retry = Object.assign({}, retry, this.#config.retry);

		this.#db.connect(this.#config.url, {
			namespace: this.#config.ns ?? this.#config.NS,
			database: this.#config.db ?? this.#config.DB,
			reconnect: this.#reconnect,
			retry: this.#retry,
		});

	}

	// Once the connection is open we always
	// attempt to authenticate with the stored
	// token, or mark as attempted if there is none.

	async #attempt() {

		let id = ++this.#attemptId;

		if (!this.token) {
			this.attempted = true;
			this.invalidated = true;
			this.emit('attempted');
			this.emit('invalidated');
			return;
		}

		for (let i = 1; i <= attempts.count; i++) {
			try {
				await this.#db.authenticate(this.token);
				if (id !== this.#attemptId) return;
				this.attempted = true;
				this.authenticated = true;
				this.emit('attempted');
				this.emit('authenticated');
				return;
			} catch (e) {
				if (id !== this.#attemptId) return;
				console.log('surreal: attempt() failed', e);
				await timeout(attempts.delay * i);
			}
		}

		if (id !== this.#attemptId) return;
		this.attempted = true;
		this.invalidated = true;
		this.emit('attempted');
		this.emit('invalidated');
		console.log('surreal: attempt() failed');

	}

	// Tear down the Surreal service,
	// ensuring we close the WebSocket
	// and remove all event listeners.

	willDestroy() {

		for (let sub of this.#live) sub.kill();
		this.#live.clear();

		for (let off of this.#listeners) off();
		this.#listeners = [];

		this.#db.close();

		this.removeAllListeners();

		super.willDestroy(...arguments);

	}

	// --------------------------------------------------
	// Direct methods
	// --------------------------------------------------

	wait() {
		return this.#db.ready;
	}

	let(key, value) {
		return this.#db.set(key, value);
	}

	unset(key) {
		return this.#db.unset(key);
	}

	query() {
		return this.#verbs.query(...arguments);
	}

	select(tb, id) {
		return this.#verbs.select(tb, id);
	}

	// Chainable, mirroring the SDK: finish with `.content(data)`, `.merge(data)`,
	// `.replace(data)` or `.patch(data)` (`create` only has `.content()`/`.patch()` -
	// see `queryable()` above for why).

	create(tb, id) {
		return this.#verbs.create(tb, id);
	}

	update(tb, id) {
		return this.#verbs.update(tb, id);
	}

	upsert(tb, id) {
		return this.#verbs.upsert(tb, id);
	}

	relate(from, edge, to, data) {
		return this.#verbs.relate(from, edge, to, data);
	}

	insert(tb, data) {
		return this.#verbs.insert(tb, data);
	}

	delete(tb, id) {
		return this.#verbs.delete(tb, id);
	}

	// Return the currently authenticated record.
	// The legacy `info()` RPC was removed, so we
	// fetch the authenticated record via `$auth`.

	async info() {
		// `$auth` is the authenticated record (record/JWT access) or empty
		// for system (root/namespace/database) auth — avoid ONLY so an
		// empty result does not throw, returning the record or undefined.
		let [rows] = await this.#db.query('SELECT * FROM $auth');
		return rows && rows[0];
	}

	// Run a set of statements atomically inside a single SurrealDB
	// transaction, retrying the whole thing on a conflict.
	//
	// `fn` is handed the same `query`/`select`/`create`/`update`/`upsert`/
	// `relate`/`insert`/`delete` surface as the service itself - built by the
	// same `queryable()` factory above, against this transaction rather than
	// the default session, just without `.retry()`: a conflict aborts the
	// *whole* transaction, so replaying one statement out of it is
	// meaningless; only replaying `fn` from scratch against a fresh
	// transaction is. That replay reuses the same policy as the single-write
	// `.retry()` calls above (`this.#retry`) rather than adding a second
	// policy to configure.
	//
	// Because of that replay, `fn` must be safe to call more than once - it
	// should build fresh payloads from its own arguments rather than mutate
	// shared or outer state, and avoid side effects outside of the scoped
	// object it is given.

	async transaction(fn) {

		let policy = this.#retry;

		for (let attempt = 0; ; attempt++) {

			let tx = await this.#db.beginTransaction();
			let scoped = queryable(tx, false);

			try {

				let result = await fn(scoped);
				await tx.commit();
				return result;

			} catch (e) {

				await tx.cancel().catch(() => {});

				let retryable = policy.enabled
					&& isRetryableConflict(e)
					&& (policy.attempts === -1 || attempt < policy.attempts);

				if (!retryable) throw e;

				let delay = Math.min(
					policy.retryDelay * (policy.retryDelayMultiplier ** (attempt + 1)),
					policy.retryDelayMax,
				);

				await timeout(delay);

			}

		}

	}

	// --------------------------------------------------
	// Live query methods
	// --------------------------------------------------

	async live(tb, where) {
		let query = this.#db.live(new Table(tb));
		if (where) query = query.where(raw(where));
		let sub = await query;
		this.#live.add(sub);
		sub.subscribe(({ action, value, recordId }) => {
			this.emit(action, value);
			switch (action) {
				case 'CREATE':
				case 'UPDATE':
					return this.store.inject(value);
				case 'DELETE':
					return this.store.remove(recordId);
			}
		});
		return sub;
	}

	kill(sub) {

		// Accepts either the subscription itself or its id. An id is matched
		// against the CURRENT id of each held subscription, because a managed
		// subscription is re-registered under a new one on every reconnect.

		let live = (sub && typeof sub === 'object')
			? sub
			: [...this.#live].find(s => String(s.id) === String(sub));

		if (live) {
			this.#live.delete(live);
			return live.kill();
		}

	}

	// --------------------------------------------------
	// Authentication methods
	// --------------------------------------------------

	async signup() {
		try {
			let { access } = await this.#db.signup(...arguments);
			this.#ls.set('surreal', access);
			this.token = access;
			this.attempted = true;
			this.invalidated = false;
			this.authenticated = true;
			this.emit('attempted');
			this.emit('authenticated');
			return Promise.resolve();
		} catch (e) {
			this.#ls.del('surreal');
			this.token = null;
			this.attempted = true;
			this.invalidated = true;
			this.authenticated = false;
			this.emit('attempted');
			this.emit('invalidated');
			throw e;
		}
	}

	async signin() {
		try {
			let { access } = await this.#db.signin(...arguments);
			this.#ls.set('surreal', access);
			this.token = access;
			this.attempted = true;
			this.invalidated = false;
			this.authenticated = true;
			this.emit('attempted');
			this.emit('authenticated');
			return Promise.resolve();
		} catch (e) {
			this.#ls.del('surreal');
			this.token = null;
			this.attempted = true;
			this.invalidated = true;
			this.authenticated = false;
			this.emit('attempted');
			this.emit('invalidated');
			throw e;
		}
	}

	async invalidate() {
		try {
			await this.#db.invalidate(...arguments);
			this.#ls.del('surreal');
			this.token = null;
			this.attempted = true;
			this.invalidated = true;
			this.authenticated = false;
			this.emit('attempted');
			this.emit('invalidated');
			return Promise.resolve();
		} catch (e) {
			this.#ls.del('surreal');
			this.token = null;
			this.attempted = true;
			this.invalidated = true;
			this.authenticated = false;
			this.emit('attempted');
			this.emit('invalidated');
			console.error('surreal: invalidate() failed', e);
			return Promise.resolve();
		}
	}

	async authenticate(t) {
		try {
			await this.#db.authenticate(t);
			if (this.#ls.get('surreal') !== t) this.#ls.set('surreal', t);
			this.token = t;
			this.attempted = true;
			this.invalidated = false;
			this.authenticated = true;
			this.emit('attempted');
			this.emit('authenticated');
			return Promise.resolve();
		} catch (e) {
			this.#ls.del('surreal');
			this.token = null;
			this.attempted = true;
			this.invalidated = true;
			this.authenticated = false;
			this.emit('attempted');
			this.emit('invalidated');
			console.error('surreal: authenticate() failed', e);
			return Promise.resolve();
		}
	}

}
