import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service('-document') document;

	compute() {
		return this.document;
	}

}
