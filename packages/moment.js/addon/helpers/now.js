import Helper from '@ember/component/helper';
import { inject } from '@ember/service';
import Date from 'moment';

export default class extends Helper {

	@inject clock;

	compute() {
		return Date(this.clock.now);
	}

}
