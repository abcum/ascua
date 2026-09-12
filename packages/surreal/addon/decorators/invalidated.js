import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { service } from '@ember/service';

export default function (target) {
	assert(
		'The @invalidated decorator can only be applied to a Route',
		!target || (target && target.prototype instanceof Route),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @invalidated decorator can only be applied to a Route',
			target && target.prototype instanceof Route,
		);
		return func(target)
	};
}

function func(target) {

	return class extends target {

		@service router;

		@service surreal;

		redirectIfAuthenticated = 'index';

		activate() {
			super.activate(...arguments);
			// Enable listening to authenticated events.
			this.surreal.on('authenticated', this, this.authenticate);
		}

		deactivate() {
			super.deactivate(...arguments);
			// Disable listening to authenticated events.
			this.surreal.off('authenticated', this, this.authenticate);
		}

		authenticate() {
			if (this.surreal.transition) {
				this.surreal.transition.retry();
			} else {
				this.router.transitionTo(this.redirectIfAuthenticated);
			}
		}

		beforeModel(transition) {
			// Redirect if connection is authenticated.
			if (this.surreal.authenticated === true) {
				return this.router.replaceWith(this.redirectIfAuthenticated);
			}
			// Continue with original hook.
			return super.beforeModel(...arguments);
		}

	};

}
