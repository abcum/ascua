import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function(target) {
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

	target.reopen({

		surreal: inject(),

		redirectIfAuthenticated: 'index',

		activate() {
			super.activate(...arguments);
			// Enable listening to authenticated events.
			this.surreal.on('authenticated', this, this.authenticate);
		},

		deactivate() {
			super.deactivate(...arguments);
			// Disable listening to authenticated events.
			this.surreal.off('authenticated', this, this.authenticate);
		},

		authenticate() {
			if (this.surreal.transition) {
				this.surreal.transition.retry();
			} else {
				this.transitionTo(this.redirectIfAuthenticated);
			}
		},

		beforeModel() {
			super.beforeModel(...arguments);
			// Wait for authentication attempt.
			return this.surreal.wait('attempted');
		},

		redirect(model, transition) {
			// Store the current desired route.
			this.surreal.transition = transition;
			// Wait for Surreal to attempt and redirect.
			return this.surreal.wait('attempted').then( () => {
				if (this.surreal.authenticated === true) {
					return this.transitionTo(this.redirectIfAuthenticated);
				}
				return super.redirect(...arguments);
			});
		},

	});

}
