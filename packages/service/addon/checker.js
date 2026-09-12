import Evented from './evented';
import { tracked } from '@glimmer/tracking';

// Shared defaults for any service that periodically
// checks for an update and can auto-apply it once
// found, unless overridden by the app's own config.

export const defaults = {
	enabled: true,
	autoupdate: false,
	frequency: 5 * 60 * 1000,
};

// Checker is the shared skeleton behind @ascua/update
// and @ascua/worker: it guards against unsupported
// environments, merges config, runs the periodic
// timer, and reacts to an 'updateready' event. Each
// subclass supplies isSupported(), resolveConfig(),
// boot(), reset() and check().

export default class Checker extends Evented {

	_timer = undefined;

	_config = undefined;

	@tracked updateready = false;

	constructor() {

		super(...arguments);

		if (this.isSupported() === false) return;

		if (window.ELECTRON === true) return;

		this._config = this.resolveConfig();

		if (this._config.enabled === true) {
			if (this._config.frequency) {
				this._timer = setInterval(
					this.check,
					this._config.frequency,
				);
			}
		}

		this.on('updateready', () => {
			switch (this._config.autoupdate) {
			case false:
				return this.updateready = true;
			case true:
				return this.reset();
			}
		});

		this.boot();

	}

	willDestroy() {

		if (this._timer) clearInterval(this._timer);

		this.removeAllListeners();

		super.willDestroy(...arguments);

	}

}
