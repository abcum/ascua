import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import Date from 'dayjs';
import { createNow } from '../utils/date-helpers';

const now = createNow(Date);

export default class extends Helper {

	@service clock;

	@service intl;

	compute() {
		return now(this.clock.now, this.intl.locale);
	}

}
