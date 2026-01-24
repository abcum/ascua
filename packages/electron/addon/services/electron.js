import Service from '@ascua/service/evented';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import config from '@ascua/config';
import Remote from '@electron/remote';
import Electron from 'electron';

const defaults = {
	autoupdate: false,
	frequency: 5 * 60 * 1000,
};

export default class extends Service {

	#timer = undefined;

	#config = undefined;

	// Whether an update is available
	// for the ember app, so that we
	// can display a notification.

	@tracked updatefound = false;

	// Whether an update is available
	// for the ember app, so that we
	// can display a notification.

	@tracked updateready = false;

	// Setup the Electron service if the
	// feature is supported, and check
	// continuously for updates.

	constructor() {

		super(...arguments);

		if (Electron === null) return;

		this.#config = Object.assign({}, defaults, config.electron);

		if (this.#config.frequency) {
			this.#timer = setInterval(
				this.check.bind(this),
				this.#config.frequency,
			);
		}

		this.on('updateready', () => {
			switch (this.#config.autoupdate) {
			case false:
				return this.updateready = true;
			case true:
				return this.reset();
			}
		});

		this.on('updatefound', () => {
			return this.updatefound = true;
		});

		this.setup();

		this.check();

	}

	// If this service is going to be
	// destroyed, then let's ensure that
	// the checker timer is cancelled.

	willDestroy() {

		if (this.#timer) clearInterval(this.#timer);

		this.removeAllListeners();

		super.willDestroy(...arguments);

	}

	// Setup setups up the event listener
	// for when an update is found on the
	// remote versioning service.

	setup() {

		if (Electron === null) return;

		document.body.setAttribute('electron', true);

		document.body.setAttribute('platform', this.platform);

		const autoUpdater = this.autoUpdater;

		if (!autoUpdater) return;

		autoUpdater.on('update-available', () => {
			this.emit('updatefound');
		});

		autoUpdater.on('update-downloaded', () => {
			this.emit('updateready');
		});

		autoUpdater.logger = console;

	}

	// Reset reloads the newer software
	// version by reloading the page
	// which will load the new version.

	@action reset() {

		const autoUpdater = this.autoUpdater;

		if (!autoUpdater) return;

		autoUpdater.quitAndInstall(true, true);

	}

	// Check determines if an update to
	// the application is available by
	// checking the server version.

	@action check() {

		if (this.updatefound) return;

		if (this.updateready) return;

		const autoUpdater = this.autoUpdater;

		if (!autoUpdater) return;

		autoUpdater.checkForUpdates().catch(() => {});

	}

	// Fetches the updater instance
	// when available, or returns
	// undefined if not available.

	get autoUpdater() {

		if (Electron === null) return undefined;

		if (Remote.app.isPackaged === false) return undefined;

		try {
			return Remote.require('electron-updater').autoUpdater;
		} catch (error) {
			if (error && error.code === 'MODULE_NOT_FOUND') return undefined;
			throw error;
		}

	}

	// When running as an Electron app,
	// then we can detect the platform
	// on which the app is running.

	get platform() {

		if (Electron === null) return;

		return Remote.require('os').platform();

	}

	// When running as an Electron app,
	// then we can get the main focused
	// browser window for the app.

	get window() {

		if (Electron === null) return;

		return Remote.BrowserWindow.getFocusedWindow();

	}

}
