import Helper from '@ember/component/helper';
import { service } from '@ember/service';

// Wraps a helper function so it recomputes whenever the intl service changes locale.
export default function localised(fn) {
	return class extends Helper {

		@service intl;

		compute(params, hash) {
			return fn(params, hash, this.intl.locale);
		}

	};
}
