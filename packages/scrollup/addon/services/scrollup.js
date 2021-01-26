import Service from '@ember/service';
import { inject } from '@ember/service';

export default class extends Service {

	@inject router;

	constructor() {

		super(...arguments);

		if (typeof FastBoot !== 'undefined') return;

		this.router.on('routeDidChange', () => {
			try {
				window.scrollTo({ top: 0, left: 0, behaviour: 'smooth' });
			} catch (e) {
				window.scrollTo(0, 0);
			}
		});

	}

}
