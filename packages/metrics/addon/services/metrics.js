import Service from '@ember/service';
import { service } from '@ember/service';

export default class extends Service {

	@service router;

	platforms = [];

	constructor() {

		super(...arguments);

		this.router.on('routeDidChange', () => {
			this.platforms.forEach(m => {
				m.trackPage();
			});
		});

	}

	clear(n) {
		switch (arguments.length) {
			case 1:
				if (this[n]) {
					return this[n].clear();
				}
			case 0:
				return this.platforms.forEach(m => {
					m.clear();
				});
		}
	}

	identify(n, id, data) {
		switch (arguments.length) {
			case 3:
				if (this[n]) {
					return this[n].identify(id, data);
				}
			case 2:
				return this.platforms.forEach(m => {
					m.identify(...arguments);
				});
		}
	}

	trackPage(n, data) {
		switch (arguments.length) {
			case 2:
				if (this[n]) {
					return this[n].trackPage(data);
				}
			case 1:
				return this.platforms.forEach(m => {
					m.trackPage(...arguments);
				});
		}
	}

	trackEvent(n, name, data) {
		switch (arguments.length) {
			case 3:
				if (this[n]) {
					return this[n].trackEvent(name, data);
				}
			case 2:
				return this.platforms.forEach(m => {
					m.trackEvent(...arguments);
				});
		}
	}

}
