import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function(target) {
	assert(
		'The @opened decorator can only be applied to a Route',
		!target || (target && target.prototype instanceof Route),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @opened decorator can only be applied to a Route',
			target && target.prototype instanceof Route,
		);
		return func(target)
	};
}

function func(target) {

	target.reopen({

		surreal: inject(),

		opened: () => {},

		activate() {
			super.activate(...arguments);
			// Enable listening to opened events.
			this.surreal.on('opened', this, this.opened);
		},

		deactivate() {
			super.deactivate(...arguments);
			// Disable listening to opened events.
			this.surreal.off('opened', this, this.opened);
		},

	});

}
