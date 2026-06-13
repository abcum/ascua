import Service from '@ascua/service/evented';
import Storage from '../classes/storage';
import config from '@ascua/config';
import unid from '../utils/unid';
import { Surreal as Database, RecordId, StringRecordId, Table } from 'surrealdb';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { assert } from '@ember/debug';
import { cache } from '@ascua/decorators';
import JWT from '../utils/jwt';

const defaults = {
	id: unid(),
	ns: undefined,
	db: undefined,
	NS: undefined,
	DB: undefined,
	url: 'wss://cloud.surrealdb.com',
};

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

	// The full configuration info for
	// SurrealDB, including NS, DB,
	// and custom endpoint options.

	#config = undefined;

	// The set of unsubscribe functions
	// for the SDK connection lifecycle
	// event listeners, cleared on destroy.

	#listeners = [];

	// The set of active live query
	// subscriptions, keyed by the
	// live query uuid string.

	#live = new Map();

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

	// Setup the Surreal service,
	// listening for token changes
	// and connecting to the DB.

	constructor() {

		super(...arguments);

		// Listen for changes to the local storage
		// authentication key, and reauthenticate
		// if the token changes from another tab.

		if (window && window.addEventListener) {
			window.addEventListener('storage', e => {
				if (e.key === 'surreal') {
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

		this.#db.connect(this.#config.url, {
			namespace: this.#config.ns ?? this.#config.NS,
			database: this.#config.db ?? this.#config.DB,
			reconnect: true,
		});

	}

	// Once the connection is open we always
	// attempt to authenticate with the stored
	// token, or mark as attempted if there is none.

	async #attempt() {
		try {
			if (!this.token) throw new Error('No authentication token');
			await this.#db.authenticate(this.token);
			this.attempted = true;
			this.authenticated = true;
			this.emit('attempted');
			this.emit('authenticated');
		} catch (e) {
			this.attempted = true;
			this.invalidated = true;
			this.emit('attempted');
			this.emit('invalidated');
		}
	}

	// Build a SurrealDB record pointer from a
	// table name and an optional id. When no id
	// is given, the whole table is targeted.

	#thing(tb, id) {
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

	// Tear down the Surreal service,
	// ensuring we close the WebSocket
	// and remove all event listeners.

	willDestroy() {

		for (let [, sub] of this.#live) sub.kill();
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
		return this.#db.query(...arguments);
	}

	select(tb, id) {
		return this.#db.select(this.#thing(tb, id));
	}

	create(tb, id, data) {
		if (arguments.length === 2) {
			[id, data] = [undefined, id];
		}
		return this.#db.create(this.#thing(tb, id)).content(data);
	}

	update(tb, id, data) {
		return this.#db.update(this.#thing(tb, id)).content(data);
	}

	change(tb, id, data) {
		return this.#db.update(this.#thing(tb, id)).merge(data);
	}

	modify(tb, id, patch) {
		return this.#db.update(this.#thing(tb, id)).patch(patch);
	}

	delete(tb, id) {
		return this.#db.delete(this.#thing(tb, id));
	}

	// Return the currently authenticated record.
	// The legacy `info()` RPC was removed, so we
	// fetch the authenticated record via `$auth`.

	async info() {
		let [auth] = await this.#db.query('SELECT * FROM ONLY $auth');
		return auth;
	}

	// --------------------------------------------------
	// Live query methods
	// --------------------------------------------------

	async live(tb) {
		let sub = await this.#db.live(new Table(tb));
		this.#live.set(sub.id, sub);
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
		let live = typeof sub === 'object' ? sub : this.#live.get(sub);
		if (live) {
			this.#live.delete(live.id);
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
			return Promise.reject();
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
			return Promise.reject();
		}
	}

	async invalidate() {
		try {
			await this.#db.invalidate(...arguments);
		} catch (e) {
			// ignore — we clear local state regardless
		}
		this.#ls.del('surreal');
		this.token = null;
		this.attempted = true;
		this.invalidated = true;
		this.authenticated = false;
		this.emit('attempted');
		this.emit('invalidated');
		return Promise.resolve();
	}

	async authenticate(t) {
		try {
			await this.#db.authenticate(t);
			this.#ls.set('surreal', t);
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
			return Promise.resolve();
		}
	}

}
