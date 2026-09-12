import Route from '@ember/routing/route';
import { assert } from '@ember/debug';
import { service } from '@ember/service';

export default function (target) {
	assert(
		'The @closed decorator can only be applied to a Route',
		!target || (target && target.prototype instanceof Route),
	);
	return target ? func(target) : (target) => {
		assert(
			'The @closed decorator can only be applied to a Route',
			target && target.prototype instanceof Route,
		);
		return func(target)
	};
}

function func(target) {

	return class extends target {

		@service surreal;

		closed() { }

		activate() {
			super.activate(...arguments);
			// Enable listening to closed events.
			this.surreal.on('closed', this, this.closed);
		}

		deactivate() {
			super.deactivate(...arguments);
			// Disable listening to closed events.
			this.surreal.off('closed', this, this.closed);
		}

	};

}
