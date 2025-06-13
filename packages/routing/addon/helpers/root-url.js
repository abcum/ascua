import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service router;

	compute([path]) {
		return `${this.router.rootURL}/${path}`.replace(/\/\/+/g, '/');
	}

}
