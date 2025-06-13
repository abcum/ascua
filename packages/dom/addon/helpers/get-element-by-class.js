import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service('-document') document;

	compute(val) {
		return this.document.getElementsByClassName(val)[0];
	}

}
