import Service from '@ascua/service/evented';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import config from '@ascua/config';
import Electron from 'electron';

const defaults = {
	autoupdate: false,
	frequency: 5 * 60 * 1000,
};

export default class extends Service {

	// Whether an update is available
	// for the ember app, so that we
	// can display a notification.

	@tracked updatefound = false;

	// Setup the Electron service if the
	// feature is supported, and check
	// continuously for updates.

	constructor() {

		super(...arguments);

		if (Electron === null) return;

		this.config = Object.assign({}, defaults, config.electron);

		if (this.config.frequency) {
			this.timer = setInterval(
				this.check.bind(this),
				this.config.frequency,
			);
		}

		this.on('updatefound', () => {
			switch (this.config.autoupdate) {
			case false:
				return this.updatefound = true;
			case true:
				return this.reset();
			}
		});

		this.setup();

		this.check();

	}

	// If this service is going to be
	// destroyed, then let's ensure that
	// the checker timer is cancelled.

	willDestroy() {

		if (this.timer) clearInterval(this.timer);

		super.willDestroy(...arguments);

	}

	// Setup setups up the event listener
	// for when an update is found on the
	// remote versioning service.

	setup() {

		if (Electron === null) return;

		document.body.setAttribute('electron', true);

		const { autoUpdater } = Electron.remote.require('electron-updater');

		autoUpdater.on('update-downloaded', () => {
			this.emit('updatefound');
		});

	}

	// Reset reloads the newer software
	// version by reloading the page
	// which will load the new version.

	@action reset() {

		if (Electron === null) return;

		const { autoUpdater } = Electron.remote.require('electron-updater');

		autoUpdater.quitAndInstall({ isSilent: true, isForceRunAfter: true });

	}

	// Check determines if an update to
	// the application is available by
	// checking the server version.

	@action check() {

		if (Electron === null) return;

		const { autoUpdater } = Electron.remote.require('electron-updater');

		autoUpdater.checkForUpdates().catch(() => {});

	}

}
