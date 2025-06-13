import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import handler from '../utils/handler';

export default class extends Helper {

	@service('-document') document;

	compute([keys, func, ...params]) {

		if (typeof FastBoot !== 'undefined') return;

		this.call = handler.bind(this, keys, func);

		this.document.removeEventListener('keydown', this.call);

		this.document.addEventListener('keydown', this.call);

	}

	willDestroy() {

		if (typeof FastBoot !== 'undefined') return;

		this.document.removeEventListener('keydown', this.call);

		super.willDestroy();

	}

}
