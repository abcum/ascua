import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import { setupSurreal } from '@ascua/surreal/test-support';
import config from 'ascua/config/environment';
import { RecordId } from 'surrealdb';

// Integration tests run only when the runner has booted a SurrealDB 3.x
// server (it sets config.surreal.integration); otherwise they are skipped
// so a plain `ember test` stays green.
const scope = (config.surreal && config.surreal.integration) ? module : () => {};

scope('Integration | surreal | connection', function (hooks) {
	setupTest(hooks);
	setupSurreal(hooks, { reset: ['author', 'book'] });

	test('the connection is opened and authenticated as root', async function (assert) {
		assert.true(this.surreal.opened, 'the websocket connection is open');
		assert.true(this.surreal.authenticated, 'signed in as root');
		assert.false(this.surreal.invalidated, 'not invalidated while signed in');
	});

	test('query resolves to a bare array of per-statement result sets', async function (assert) {
		let result = await this.surreal.query('RETURN 1');
		assert.true(Array.isArray(result), 'query resolves to a bare array');
		assert.strictEqual(result.length, 1, 'one statement yields one result set');
		assert.strictEqual(result[0], 1, 'the first result set is the returned value');
	});

	test('invalidate clears auth and signin restores it', async function (assert) {
		await this.surreal.invalidate();
		assert.false(this.surreal.authenticated, 'no longer authenticated after invalidate');
		assert.true(this.surreal.invalidated, 'marked invalidated after invalidate');

		await this.surreal.signin({ username: 'root', password: 'root' });
		assert.true(this.surreal.authenticated, 'authenticated again after signin');
		assert.false(this.surreal.invalidated, 'no longer invalidated after signin');
	});
});
