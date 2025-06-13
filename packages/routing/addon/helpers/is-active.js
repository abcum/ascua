import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service router;

	compute([...params]) {
		return this.router.currentRouteName === params[0] || this.router.isActive(...params);
	}

}
