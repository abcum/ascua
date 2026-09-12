import Checker, { defaults } from '@ascua/service/checker';
import { action } from '@ember/object';
import config from '@ascua/config';

export default class extends Checker {

	isSupported() {
		try {
			if (typeof FastBoot !== 'undefined') throw "exception";
			if (!window) throw "exception";
			if (!window.location) throw "exception";
			return true;
		} catch (e) {
			return false;
		}
	}

	resolveConfig() {
		return Object.assign({}, defaults, config.update);
	}

	// Once the app's version check is set up, run an
	// immediate check so a stale tab notices right away.

	boot() {
		this.check();
	}

	// Reset reloads the newer software
	// version by reloading the page
	// which will load the new version.

	@action reset() {

		window.location.reload();

	}

	// Check determines if an update to
	// the application is available by
	// checking the server version.

	@action check() {

		if (this.updateready) return;

		if (this._config.enabled === true) {

			let url = `/version.txt?_=${new Date().getTime()}`;

			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onload = () => {
				if (this.version === undefined) {
					this.version = xhr.responseText;
				} else if (this.version != xhr.responseText) {
					this.emit('updateready');
				}
			};
			xhr.send();

		}

	}

}
