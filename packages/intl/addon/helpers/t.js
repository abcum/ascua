import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service intl;

	compute([ key ], values) {
		return this.intl.t(key, values);
	}

}
