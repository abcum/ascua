const { app, protocol } = require('electron');
const { join, dirname } = require('path');
const fs = require('fs');

const PATH = app.getAppPath();
const BASE = join(PATH, 'dist');
const INDX = join(BASE, 'index.html');

protocol.registerSchemesAsPrivileged([
	{ scheme: 'ember', privileges: { standard: true, secure: true } },
]);

app.once('ready', () => {

	protocol.registerFileProtocol('ember', (req, fn) => {

		const FILE = req.url.substr(12);
		const FULL = join(BASE, FILE);

		try {
			let stat = fs.statSync(FULL);
			return stat.isFile() ? fn(FULL) : fn(INDX);
		} catch (e) {
			return fn(INDX);
		}

	});

});

app.on('open-url', (e, path) => {
	if (global.lastWindow) {
		global.lastWindow.webContents.send('open-link', path);
	}
});

app.on('open-file', (e, path) => {
	if (global.lastWindow) {
		global.lastWindow.webContents.send('open-file', path);
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('web-contents-created', (e, contents) => {
	if (contents.getType() === 'webview') {
		contents.on('new-window', (e, url) => {
			e.preventDefault();
		});
	}
});

app.on('browser-window-created', (e, window) => {

	window.on('focus', () => {
		global.lastWindow = window;
	});

	window.on('swipe', (e, direction) => {
		switch (direction) {
		case 'left':
			return window.webContents.send('swipe-left');
		case 'right':
			return window.webContents.send('swipe-right');
		}
	});

	window.webContents.on('did-fail-load', (e, int, text, url) => {
		setTimeout( () => {
			if (!window.isDestroyed()) {
				window.loadURL(process.env.EMBER_ELECTRON_LOCATION || INDX);
			}
		}, 1000);
	});

});
