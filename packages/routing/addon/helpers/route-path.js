import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service router;

	compute() {
		return this.router.currentURL.split('?')[0] || '';
	}

}
