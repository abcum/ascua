import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import country from '../utils/country';

export function format(params) {
	return country(params[0]) || params[0];
}

export default class extends Helper {

	@service intl;

	compute(params) {
		let code = params[0];
		// Other languages use the browser's region names; English keeps the bundled list, which also covers three-letter codes.
		if (this.intl.locale.split('-')[0] !== 'en' && /^[A-Za-z]{2}$/.test(code)) {
			try {
				return this.intl.name(code.toUpperCase()) || format(params);
			} catch {
				return format(params);
			}
		}
		return format(params);
	}

}
