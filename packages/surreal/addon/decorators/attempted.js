import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { inject } from '@ember/service';

export default function(target) {
	assert(
		'The @attempted decorator can only be applied to a Route',
		!target || (target && target.prototype instanceof Route),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @attempted decorator can only be applied to a Route',
			target && target.prototype instanceof Route,
		);
		return func(target)
	};
}

function func(target) {

	target.reopen({

		surreal: inject(),

		beforeModel() {
			super.beforeModel(...arguments);
			// Wait for authentication attempt.
			return this.surreal.wait();
		},

	});

}
