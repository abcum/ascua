import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, autosaved } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// SurrealDB datetimes carry nanosecond precision; a JavaScript `Date` carries
// milliseconds. Every `time::now()` the server writes therefore has more
// precision than the connector can hold, which matters twice over: the value
// must survive being read, and — more importantly — a record must not look
// changed merely because reading it rounded a timestamp, or every load would
// queue a write.

scope('Integration | surreal | datetime precision', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'doodad'] });

	test('a server-generated timestamp does not make the record dirty', async function (assert) {
		await this.surreal.query('CREATE doodad:t1 SET text = "x", when = time::now()');

		let doodad = await this.store.select('doodad', 'doodad:t1', { reload: true });

		assert.false(doodad.dirty, 'a freshly-loaded record with a server timestamp has nothing to save');
	});

	test('a server-generated timestamp does not queue a write on load', async function (assert) {
		await this.surreal.query('CREATE doodad:t2 SET text = "x", when = time::now()');

		let writes = 0;
		let original = this.surreal.modify.bind(this.surreal);
		this.surreal.modify = function (...args) {
			writes++;
			return original(...args);
		};

		let doodad = await this.store.select('doodad', 'doodad:t2', { reload: true });
		await autosaved(doodad);

		assert.strictEqual(writes, 0, 'loading it wrote nothing back');
	});

	test('reloading repeatedly never queues a write', async function (assert) {
		await this.surreal.query('CREATE doodad:t3 SET text = "x", when = time::now()');

		let doodad = await this.store.select('doodad', 'doodad:t3', { reload: true });
		await autosaved(doodad);

		let writes = 0;
		let original = this.surreal.modify.bind(this.surreal);
		this.surreal.modify = function (...args) {
			writes++;
			return original(...args);
		};

		for (let i = 0; i < 3; i++) {
			await this.store.select('doodad', doodad.id, { reload: true });
		}
		await autosaved(doodad);

		assert.strictEqual(writes, 0, 'three reloads wrote nothing');
	});

	test('a sub-millisecond timestamp is readable', async function (assert) {
		await this.surreal.query(
			'CREATE doodad:t4 SET when = <datetime> "2026-09-14T12:00:00.123456789Z"',
		);

		let doodad = await this.store.select('doodad', 'doodad:t4', { reload: true });

		assert.ok(doodad.when, 'the value is readable');
		assert.strictEqual(
			new Date(doodad.when).toISOString().slice(0, 23),
			'2026-09-14T12:00:00.123',
			'to the millisecond the platform can represent',
		);
	});

	test('a record with a sub-millisecond timestamp is not dirty', async function (assert) {
		await this.surreal.query(
			'CREATE doodad:t5 SET text = "x", when = <datetime> "2026-09-14T12:00:00.123456789Z"',
		);

		let doodad = await this.store.select('doodad', 'doodad:t5', { reload: true });

		assert.false(doodad.dirty, 'the rounding did not register as a change');
	});

	test('editing another field does not rewrite an untouched timestamp', async function (assert) {
		// The consequence if it did: every save would quietly truncate a
		// precision the server had and the client never asked to change.
		await this.surreal.query(
			'CREATE doodad:t6 SET text = "x", when = <datetime> "2026-09-14T12:00:00.123456789Z"',
		);

		let doodad = await this.store.select('doodad', 'doodad:t6', { reload: true });

		doodad.text = 'y';
		await autosaved(doodad);

		let [rows] = await this.surreal.query(
			'SELECT time::format(when, "%Y-%m-%dT%H:%M:%S%.9f") AS precise FROM doodad:t6',
		);

		assert.strictEqual(
			rows[0].precise,
			'2026-09-14T12:00:00.123456789',
			'the nanoseconds the client never touched are still on the server',
		);
	});

	test('a timestamp the client does set round-trips to the millisecond', async function (assert) {
		let doodad = await this.store.create('doodad', 't7', {});

		doodad.when = new Date('2026-09-14T12:00:00.456Z');
		await autosaved(doodad);

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
		assert.strictEqual(
			new Date(reloaded.when).toISOString(),
			'2026-09-14T12:00:00.456Z',
			'the value the client set came back exactly',
		);
	});

	test('a timestamp inside an embedded object does not make the record dirty', async function (assert) {
		await this.surreal.query('CREATE doodad:t8 SET bits = { when: time::now(), text: "x" }');

		let doodad = await this.store.select('doodad', 'doodad:t8', { reload: true });

		assert.false(doodad.dirty, 'a nested server timestamp is not a change either');
	});

	test('an array of timestamps does not make the record dirty', async function (assert) {
		await this.surreal.query('CREATE doodad:t9 SET whens = [time::now(), time::now()]');

		let doodad = await this.store.select('doodad', 'doodad:t9', { reload: true });

		assert.false(doodad.dirty, 'an array of server timestamps is not a change');
	});

	test('an epoch and a far-future timestamp round-trip', async function (assert) {
		let doodad = await this.store.create('doodad', 't10', {});

		for (const iso of ['1970-01-01T00:00:00.000Z', '2999-12-31T23:59:59.999Z']) {
			doodad.when = new Date(iso);
			await autosaved(doodad);

			let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
			assert.strictEqual(new Date(reloaded.when).toISOString(), iso, `round-tripped ${iso}`);
		}
	});

	test('a timestamp given in a non-UTC offset is normalised', async function (assert) {
		let doodad = await this.store.create('doodad', 't11', {});

		doodad.when = '2026-09-14T13:00:00.000+01:00';
		await autosaved(doodad);

		let reloaded = await this.store.select('doodad', doodad.id, { reload: true });
		assert.strictEqual(
			new Date(reloaded.when).toISOString(),
			'2026-09-14T12:00:00.000Z',
			'the same instant, expressed in UTC',
		);
	});
});
