import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal, trackSockets, until } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';

const scope = (config.surreal && config.surreal.integration) ? module : () => {};

// Session variables set with `let`.
//
// These are not a convenience: an app can define table and field PERMISSIONS
// in terms of one, and SurrealDB then filters both query results and live
// notifications against it. app.hireinsight.io does exactly that with
// `$account` — twenty-seven tables and twenty-three fields are gated on it —
// so a connection where it is unset does not fail loudly, it quietly returns
// less data.
//
// Which makes the question of whether one survives a reconnect a data
// question, not a plumbing one.

scope('Integration | surreal | session variables', function (hooks) {
	trackSockets(hooks);
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author'] });

	async function value(surreal, name) {
		let [rows] = await surreal.query(`RETURN $${name}`);
		return rows;
	}

	test('a variable set with let is readable', async function (assert) {
		await this.surreal.let('marker', 'hello');

		assert.strictEqual(await value(this.surreal, 'marker'), 'hello', 'readable in a query');
	});

	test('unset removes it', async function (assert) {
		await this.surreal.let('marker', 'hello');
		await this.surreal.unset('marker');

		assert.notOk(await value(this.surreal, 'marker'), 'gone');
	});

	test('a variable survives a reconnection', async function (assert) {
		// If it does not, every permission written in terms of it silently
		// stops matching the moment the socket blips — queries come back
		// missing their guarded fields, and live notifications stop arriving
		// at all — until whatever set it happens to run again.
		await this.surreal.let('marker', 'hello');
		assert.strictEqual(await value(this.surreal, 'marker'), 'hello', 'set to begin with');

		this.drop();

		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		assert.strictEqual(
			await value(this.surreal, 'marker'),
			'hello',
			'still set after the connection came back',
		);
	});

	test('a variable survives repeated reconnections', async function (assert) {
		await this.surreal.let('marker', 'hello');

		for (let i = 0; i < 2; i++) {
			this.drop();
			await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
			await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });
		}

		assert.strictEqual(await value(this.surreal, 'marker'), 'hello', 'still set');
	});

	test('several variables all survive', async function (assert) {
		await this.surreal.let('one', 1);
		await this.surreal.let('two', 'two');
		await this.surreal.let('three', { nested: true });

		this.drop();
		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		assert.strictEqual(await value(this.surreal, 'one'), 1, 'a number');
		assert.strictEqual(await value(this.surreal, 'two'), 'two', 'a string');
		assert.deepEqual(await value(this.surreal, 'three'), { nested: true }, 'an object');
	});

	test('an unset variable stays unset across a reconnection', async function (assert) {
		await this.surreal.let('marker', 'hello');
		await this.surreal.unset('marker');

		this.drop();
		await until(() => this.surreal.opened === false, { timeout: 5000, label: 'the drop' });
		await until(() => this.surreal.authenticated === true, { timeout: 15000, label: 'reconnection' });

		assert.notOk(await value(this.surreal, 'marker'), 'not resurrected by the reconnection');
	});
});
