import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import Date from 'moment';

export default class extends Helper {

	@service clock;

	compute() {
		return Date(this.clock.now);
	}

}
