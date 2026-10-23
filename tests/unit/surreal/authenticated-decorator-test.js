import { module, test } from 'qunit';
import { setupTest } from 'ascua/tests/helpers';
import Route from '@ember/routing/route';
import authenticated from '@ascua/surreal/decorators/authenticated';

// A route waiting for session identification must not hang when the
// connection is invalidated before the session is identified.

module('Unit | surreal | authenticated decorator', function (hooks) {
	setupTest(hooks);

	hooks.beforeEach(function () {
		this.surreal = this.owner.lookup('service:surreal');
		this.redirects = [];

		const Guarded = authenticated(class extends Route {
			beforeModel() {
				return 'continued';
			}
		});

		this.owner.register('route:guarded-test', Guarded);
		this.route = this.owner.lookup('route:guarded-test');
		this.route.router = {
			replaceWith: (name) => {
				this.redirects.push(name);
				return Promise.resolve(name);
			},
		};
	});

	test('an invalidation while waiting for the session redirects to sign-in', async function (assert) {
		if (this.surreal.authenticated) {
			assert.ok(true, 'the session is already identified, so there is nothing to wait for');
			return;
		}

		let pending = this.route.beforeModel({});

		this.surreal.emit('invalidated');

		await pending;

		assert.deepEqual(this.redirects, ['signin'], 'redirected to sign-in');
	});
});
