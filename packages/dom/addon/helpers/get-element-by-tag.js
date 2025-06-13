import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service('-document') document;

	compute(val) {
		return this.document.getElementsByTagName(val)[0];
	}

}
