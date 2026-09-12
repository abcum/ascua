import Checker, { defaults } from '@ascua/service/checker';
import { action } from '@ember/object';
import config from '@ascua/config';

export default class extends Checker {

	isSupported() {
		try {
			if (typeof FastBoot !== 'undefined') throw "exception";
			if (!window) throw "exception";
			if (!window.navigator) throw "exception";
			if (!window.navigator.serviceWorker) throw "exception";
			return true;
		} catch (e) {
			return false;
		}
	}

	resolveConfig() {
		return Object.assign({}, defaults, config.worker);
	}

	boot() {
		this.setup();
	}

	// Setup sets up the service worker
	// and checks for any version changes
	// if the service worker is updated

	setup() {

		if (this._config.enabled === false) {

			let sw = window.navigator.serviceWorker;

			// Deregister all of the service worker
			// registrations at the root of the
			// domain, and then exit.

			sw.getRegistrations().then(regs => {
				for (let reg of regs) {
					reg.unregister();
				}
			});

		}

		if (this._config.enabled === true) {

			let sw = window.navigator.serviceWorker;

			// If a new service worker is activated
			// with skipWaiting, and claims this page
			// then we need to reload the window.

			sw.addEventListener('controllerchange', () => {
				if (this.active) window.location.reload();
			});

			// Register the service worker file at
			// the root of the domain, and wait for
			// the registration to be successful.

			sw.register('/sw.js').then(reg => {

				this.worker = reg;

				// If a service worker is waiting to
				// be activated on page load, then
				// immediately activate it and reload.

				if (reg.waiting) {
					this.emit('updateready');
				}

				// If an updated service worker is
				// found, then wait for it to install
				// and trigger an 'updateready' event.

				reg.addEventListener('updateready', (e) => {
					e.target.installing.addEventListener('statechange', (e) => {
						if (e.target.state === 'installed') {

							this.active = this.worker.active;

							if (this.active) {
								return this.emit('updateready');
							} else {
								return this.worker.waiting.postMessage('skipWaiting');
							}

						}
					});
				});

			});

		}

	}

	// Reset reloads the page, notifying
	// the new installed service worker
	// to skip waiting and activate.

	@action reset() {

		if (this.worker && this.worker.waiting) {
			this.worker.waiting.postMessage('skipWaiting');
		}

	}

	// Check determines if an update to
	// the application is available by
	// checking the service worker.

	@action check() {

		if (this.worker) {
			this.worker.update();
		}

	}

}
