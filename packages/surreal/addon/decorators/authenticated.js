import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { service } from '@ember/service';

export default function (target) {
	assert(
		'The @authenticated decorator can only be applied to a Route',
		!target || (target && target.prototype instanceof Route),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @authenticated decorator can only be applied to a Route',
			target && target.prototype instanceof Route,
		);
		return func(target)
	};
}

function func(target) {

	return class extends target {

		@service router;

		@service surreal;

		@service session;

		redirectIfInvalidated = 'signin';

		activate() {
			super.activate(...arguments);
			// Enable listening to invalidated events.
			this.surreal.on('invalidated', this, this.invalidate);
		}

		deactivate() {
			super.deactivate(...arguments);
			// Disable listening to invalidated events.
			this.surreal.off('invalidated', this, this.invalidate);
		}

		invalidate() {
			this.router.transitionTo(this.redirectIfInvalidated);
		}

		beforeModel(transition) {
			// Store the current desired route.
			this.surreal.transition = transition;
			// Redirect if connection is invalidated.
			if (this.surreal.invalidated === true) {
				return this.router.replaceWith(this.redirectIfInvalidated);
			}
			// Wait for session identification, or for an invalidation that happens while waiting.
			return new Promise((resolve) => {
				const onInvalidated = () => {
					this.surreal.off('invalidated', onInvalidated);
					resolve(this.router.replaceWith(this.redirectIfInvalidated));
				};
				this.surreal.on('invalidated', onInvalidated);
				this.session.ready.then(() => {
					this.surreal.off('invalidated', onInvalidated);
					// Continue with original hook.
					resolve(super.beforeModel(...arguments));
				});
			});
		}

	};

}
