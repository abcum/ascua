import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import JWT from '@ascua/surreal/utils/jwt';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Authentication, and the session service built on top of it. The connector's
// flags gate route transitions in consuming apps, so a flag that lies — still
// reporting authenticated after a sign-out, or never reporting it after a
// sign-in — sends the whole app to the wrong place.

scope('Integration | surreal | session', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author'] });

	// ------------------------------------------------------------------
	// Flags
	// ------------------------------------------------------------------

	test('signing in as root sets the flags', async function (assert) {
		assert.true(this.surreal.opened, 'connection open');
		assert.true(this.surreal.attempted, 'an attempt was made');
		assert.true(this.surreal.authenticated, 'authenticated');
		assert.false(this.surreal.invalidated, 'not invalidated');
	});

	test('invalidating clears the flags and the token', async function (assert) {
		await this.surreal.invalidate();

		assert.false(this.surreal.authenticated, 'no longer authenticated');
		assert.true(this.surreal.invalidated, 'invalidated');
		assert.true(this.surreal.attempted, 'still counts as attempted');
		assert.strictEqual(this.surreal.token, null, 'the token was dropped');
	});

	test('signing back in restores the flags', async function (assert) {
		await this.surreal.invalidate();
		await this.surreal.signin({ username: 'root', password: 'root' });

		assert.true(this.surreal.authenticated, 'authenticated again');
		assert.false(this.surreal.invalidated, 'no longer invalidated');
	});

	test('a failed sign-in leaves the connection unauthenticated', async function (assert) {
		await this.surreal.invalidate();

		await assert.rejects(
			this.surreal.signin({ username: 'root', password: 'wrong' }),
			'a bad password is rejected',
		);

		assert.false(this.surreal.authenticated, 'still not authenticated');
		assert.true(this.surreal.invalidated, 'and marked invalidated');
		assert.strictEqual(this.surreal.token, null, 'with no token kept');
	});

	test('a failed sign-in rejects with a reason, not with undefined', async function (assert) {
		// A login form has nothing else to show the person in front of it, and
		// `Promise.reject()` with no argument is not even loggable — every
		// failure arrived as `undefined`, so a wrong password, a missing access
		// definition and a connection that was not up were indistinguishable.
		await this.surreal.invalidate();

		let reason;
		try {
			await this.surreal.signin({ username: 'root', password: 'wrong' });
		} catch (e) {
			reason = e;
		}

		assert.ok(reason, 'the rejection carried something');
		assert.ok(
			String(reason.message || reason).length > 0,
			`and it describes the failure: ${reason && (reason.message || reason)}`,
		);
	});

	test('signing in to an access that does not exist says so', async function (assert) {
		await this.surreal.invalidate();

		let reason;
		try {
			await this.surreal.signin({ namespace: 'test', database: 'test', access: 'no_such_access' });
		} catch (e) {
			reason = e;
		}

		assert.ok(reason, 'rejected');
		assert.ok(
			/access/i.test(String(reason.message || reason)),
			`naming the problem: ${reason && (reason.message || reason)}`,
		);
	});

	test('a failed sign-in does not leave a stale token in storage', async function (assert) {
		await this.surreal.invalidate();
		try {
			await this.surreal.signin({ username: 'root', password: 'wrong' });
		} catch (e) {
			// expected
		}

		assert.notOk(window.localStorage.getItem('surreal'), 'nothing was written to storage');
	});

	// ------------------------------------------------------------------
	// Record access
	// ------------------------------------------------------------------

	test('signing in to a record access yields that record as the session', async function (assert) {
		await this.surreal.invalidate();
		await this.surreal.signin({ namespace: 'test', database: 'test', access: 'restricted' });

		assert.true(this.surreal.authenticated, 'authenticated under the record access');

		let info = await this.surreal.info();
		assert.strictEqual(String(info.id), 'restricted_owner:only', '$auth is the signed-in record');
	});

	test('the session service exposes the authenticated record', async function (assert) {
		await this.surreal.invalidate();

		let session = this.owner.lookup('service:session');

		await this.surreal.signin({ namespace: 'test', database: 'test', access: 'restricted' });
		await until(() => session.model && session.model.id, { timeout: 5000, label: 'the session model' });

		assert.strictEqual(String(session.model.id), 'restricted_owner:only', 'the session holds the record');
		assert.strictEqual(session.model.name, 'only', 'with its fields');
	});

	test('the session model is cleared on invalidate', async function (assert) {
		await this.surreal.invalidate();

		let session = this.owner.lookup('service:session');

		await this.surreal.signin({ namespace: 'test', database: 'test', access: 'restricted' });
		await until(() => session.model && session.model.id, { timeout: 5000, label: 'the session model' });

		await this.surreal.invalidate();

		assert.notOk(session.model && session.model.id, 'the session model was emptied');
	});

	test('invalidating empties the record cache', async function (assert) {
		await this.store.create('author', 'sa', { name: 'Cached' });
		assert.strictEqual(this.store.cached('author').length, 1, 'cached to begin with');

		await this.surreal.invalidate();

		assert.strictEqual(this.store.cached('author').length, 0, 'the cache was reset on sign-out');
	});

	test('root auth has no $auth record', async function (assert) {
		// System auth is not a record, so `info()` must resolve to nothing
		// rather than throwing on an empty result.
		let info = await this.surreal.info();

		assert.notOk(info, 'no record for a root session');
	});

	// ------------------------------------------------------------------
	// Tokens
	// ------------------------------------------------------------------

	test('a signed-in session holds a parseable token', async function (assert) {
		await this.surreal.invalidate();
		await this.surreal.signin({ namespace: 'test', database: 'test', access: 'restricted' });

		assert.ok(this.surreal.token, 'a token is held');

		let claims = this.surreal.jwt;
		assert.ok(claims, 'the token parsed');
		assert.strictEqual(claims.NS ?? claims.ns, 'test', 'carrying the namespace');
		assert.strictEqual(claims.DB ?? claims.db, 'test', 'and the database');
	});

	test('authenticating with a known-good token succeeds', async function (assert) {
		await this.surreal.invalidate();
		await this.surreal.signin({ namespace: 'test', database: 'test', access: 'restricted' });

		let token = this.surreal.token;

		await this.surreal.invalidate();
		assert.false(this.surreal.authenticated, 'signed out');

		await this.surreal.authenticate(token);
		assert.true(this.surreal.authenticated, 'the token was accepted');
	});

	test('authenticating with a bad token leaves the session invalidated', async function (assert) {
		await this.surreal.authenticate('not.a.token');

		assert.false(this.surreal.authenticated, 'not authenticated');
		assert.true(this.surreal.invalidated, 'marked invalidated');
		assert.strictEqual(this.surreal.token, null, 'and no token kept');
	});

	// ------------------------------------------------------------------
	// Records with no model
	// ------------------------------------------------------------------

	test('looking up an unknown model names the table it could not find', function (assert) {
		assert.throws(
			() => this.store.lookup('no_such_table'),
			/no_such_table/,
			'the error names the missing model rather than failing on undefined',
		);
	});

	test('injecting a record for an unmodelled table does not take the caller down', async function (assert) {
		// These arrive from places nothing awaits - a live notification, a
		// linked record of an unexpected type, `$auth` - so one must not
		// become an unhandled error that stops whatever else is running.
		await this.surreal.query('DEFINE TABLE IF NOT EXISTS unmodelled SCHEMALESS; CREATE unmodelled:one SET name = "x"');

		let [rows] = await this.surreal.query('SELECT * FROM unmodelled:one');

		let result;
		try {
			result = this.store.inject(rows[0]);
		} catch (e) {
			result = '<threw>';
		}

		assert.notStrictEqual(result, '<threw>', 'injection did not throw');
		assert.notOk(result, 'and yielded nothing for the record it could not build');
	});

	test('one unmodelled record does not discard the others in the same batch', async function (assert) {
		await this.surreal.query('DEFINE TABLE IF NOT EXISTS unmodelled SCHEMALESS; CREATE unmodelled:two SET name = "x"');
		await this.store.create('author', 'sb', { name: 'Kept' });

		let [bad] = await this.surreal.query('SELECT * FROM unmodelled:two');
		let [good] = await this.surreal.query('SELECT * FROM author:sb');

		let injected = this.store.inject([bad[0], good[0]]);

		assert.strictEqual(injected.length, 1, 'the usable record still came back');
		assert.strictEqual(injected[0].name, 'Kept', 'and it is the right one');
	});

	test('the jwt helper tolerates rubbish rather than throwing', function (assert) {
		assert.strictEqual(JWT(undefined), null, 'undefined');
		assert.strictEqual(JWT(null), null, 'null');
		assert.strictEqual(JWT(''), null, 'an empty string');
		assert.strictEqual(JWT('nonsense'), null, 'a non-token string');
		assert.strictEqual(JWT('a.b.c'), null, 'three non-base64 segments');
		assert.strictEqual(JWT(42), null, 'a number');
	});

	test('the jwt helper reads the header when asked', function (assert) {
		let header = { alg: 'HS512', typ: 'JWT' };
		let body = { ns: 'test' };
		let encode = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '');
		let token = `${encode(header)}.${encode(body)}.signature`;

		assert.deepEqual(JWT(token), body, 'the payload by default');
		assert.deepEqual(JWT(token, { header: true }), header, 'the header on request');
	});

	// ------------------------------------------------------------------
	// Events
	// ------------------------------------------------------------------

	test('authenticating and invalidating emit their events', async function (assert) {
		let seen = [];
		let ctx = {};

		this.surreal.on('authenticated', ctx, () => seen.push('authenticated'));
		this.surreal.on('invalidated', ctx, () => seen.push('invalidated'));

		await this.surreal.invalidate();
		await this.surreal.signin({ username: 'root', password: 'root' });

		this.surreal.off('authenticated', ctx);
		this.surreal.off('invalidated', ctx);

		assert.deepEqual(seen, ['invalidated', 'authenticated'], 'both fired, in order');
	});
});
