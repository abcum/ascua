import Service from '@ember/service';
import { service } from '@ember/service';

export default class extends Service {

	@service router;

	get name() {
		return this.router.currentRouteName;
	}

	get path() {
		return this.router.currentURL.split('?')[0] || '';
	}

	get vars() {
		return this.router.currentURL.split('?')[1] || '';
	}

	get query() {
		return this.vars.split('&').filter(p => p).reduce((o, p) => {
			let bit = p.split('=');
			let key = decodeURIComponent(bit[0]);
			let val = decodeURIComponent(bit[1]) || null;
			o[key] = val;
			return o;
		}, {});
	}

}
