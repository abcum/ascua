import Helper from '@ember/component/helper';
import { inject } from '@ember/service';

export default class extends Helper {

	@inject router;

	compute() {
		let vars = this.router.currentURL.split('?')[1] || '';
		return vars.split('&').filter(p => p).reduce( (o, p) => {
			let bit = p.split('=');
			let key = decodeURIComponent(bit[0]);
			let val = decodeURIComponent(bit[1]) || null;
			o[key] = val;
			return o;
		}, {});
	}

}
