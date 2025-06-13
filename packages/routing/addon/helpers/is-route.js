import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service router;

	compute([route]) {
		return this.router.currentRouteName === route;
	}

}
