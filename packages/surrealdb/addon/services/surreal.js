import Service from '@ascua/service/evented';
import Storage from '../classes/storage';
import config from '@ascua/config';
import unid from '../utils/unid';
import Database from 'surrealdb.js';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { assert } from '@ember/debug';
import { cache } from '@ascua/decorators';
import JWT from '../utils/jwt';

const defaults = {
  id: unid(),
  ns: undefined,
  db: undefined,
  NS: undefined,
  DB: undefined,
  url: Database.EU,
};

export default class Surreal extends Service {
  @inject store;

  // The localStorage proxy class
  // which enables us to write to
  // localStorage if it is enabled.

  #ls = new Storage();

  // The underlying instance of
  // the Surreal database which
  // connects to the server.

  #db = null;

  // The full configuration info for
  // SurrealDB, including NS, DB,
  // and custom endpoint options.

  #config = undefined;

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
      window.addEventListener('storage', (e) => {
        if (e.key === 'surreal') {
          this.authenticate(e.newValue);
        }
      });
    }

    // Get the configuration options
    // which have been specified in the
    // app environment config file.

    this.#config = Object.assign({}, defaults, config.surreal);

    this.#db = new Database(this.#config.url);

    // Get the token so that it populates
    // the jwt getter value, so that the
    // token contents can be accessed.

    this.token = this.#db.token = this.#ls.get('surreal');

    assert(
      'Set the `surreal.ns` property in your environment config as a string',
      this.#config.namespace !== undefined ||
        this.#config.NAMESPACE !== undefined
    );

    assert(
      'Set the `surreal.db` property in your environment config as a string',
      this.#config.database !== undefined || this.#config.DATABASE !== undefined
    );

    // Open the websocket for the first
    // time. This will automatically
    // attempt to reconnect on failure.

    if (this.#config.uri) this.#config.url = `${this.#config.uri}/rpc`;

    // Open the websocket for the first
    // time. This will automatically
    // attempt to reconnect on failure.

    this.#db.connect(this.#config.url, this.#config);

    this.#db.use({
      namespace: this.#config.NAMESPACE,
      database: this.#config.DATABASE,
    });
  }

  // Tear down the Surreal service,
  // ensuring we stop the pinger,
  // and close the WebSocket.

  willDestroy() {
    this.#db.close();

    this.removeAllListeners();

    // this.#db.removeAllListeners();

    super.willDestroy(...arguments);
  }

  // --------------------------------------------------
  // Direct methods
  // --------------------------------------------------

  use() {
    return this.#db.use(...arguments);
  }

  wait() {
    return this.#db.wait(...arguments);
  }

  close() {
    return this.#db.close(...arguments);
  }

  info() {
    return this.#db.info(...arguments);
  }

  let() {
    return this.#db.let(...arguments);
  }

  unset() {
    return this.#db.unset(...arguments);
  }

  query() {
    return this.#db.query(...arguments);
  }

  query_raw() {
    return this.#db.query_raw(...arguments);
  }

  select() {
    return this.#db.select(...arguments);
  }

  create() {
    return this.#db.create(...arguments);
  }

  update() {
    return this.#db.update(...arguments);
  }

  merge() {
    return this.#db.merge(...arguments);
  }

  patch() {
    return this.#db.patch(...arguments);
  }

  delete() {
    return this.#db.delete(...arguments);
  }

  live() {
    return this.#db.live(...arguments);
  }

  listenLive() {
    return this.#db.listenLive(...arguments);
  }

  // --------------------------------------------------
  // Authentication methods
  // --------------------------------------------------

  async signup() {
    try {
      let t = await this.#db.signup(...arguments);
      this.#ls.set('surreal', t);
      this.token = t;
      this.#db.token = t;
      this.attempted = true;
      this.invalidated = false;
      this.authenticated = true;
      this.emit('attempted');
      this.emit('authenticated');
      return Promise.resolve();
    } catch (e) {
      this.#ls.del('surreal');
      this.token = null;
      this.#db.token = null;
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
      let t = await this.#db.signin(...arguments);
      this.#ls.set('surreal', t);
      this.token = t;
      this.#db.token = t;
      this.attempted = true;
      this.invalidated = false;
      this.authenticated = true;
      this.emit('attempted');
      this.emit('authenticated');
      return Promise.resolve();
    } catch (e) {
      this.#ls.del('surreal');
      this.token = null;
      this.#db.token = null;
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
      this.#ls.del('surreal');
      this.token = null;
      this.#db.token = null;
      this.attempted = true;
      this.invalidated = true;
      this.authenticated = false;
      this.emit('attempted');
      this.emit('invalidated');
      return Promise.resolve();
    } catch (e) {
      this.#ls.del('surreal');
      this.token = null;
      this.#db.token = null;
      this.attempted = true;
      this.invalidated = true;
      this.authenticated = false;
      this.emit('attempted');
      this.emit('invalidated');
      return Promise.resolve();
    }
  }

  async authenticate(t) {
    try {
      await this.#db.authenticate(...arguments);
      this.#ls.set('surreal', t);
      this.token = t;
      this.#db.token = t;
      this.attempted = true;
      this.invalidated = false;
      this.authenticated = true;
      this.emit('attempted');
      this.emit('authenticated');
      return Promise.resolve();
    } catch (e) {
      this.#ls.del('surreal');
      this.token = null;
      this.#db.token = null;
      this.attempted = true;
      this.invalidated = true;
      this.authenticated = false;
      this.emit('attempted');
      this.emit('invalidated');
      return Promise.resolve();
    }
  }
}
