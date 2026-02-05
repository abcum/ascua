'use strict';

const fs = require('fs');
const path = require('path');
const Builder = require('electron-builder');
const Notarizer = require('@electron/notarize');
const Command = require('ember-cli/lib/commands/build');
const { log } = require('builder-util');

const APPLE_ID = process.env.APPLE_ID;
const APPLE_TEAMID = process.env.APPLE_TEAMID;
const APPLE_PASSWORD = process.env.APPLE_APP_SPECIFIC_PASSWORD;

module.exports = Command.extend({

	name: 'electron:build',

	description: 'Builds and packages your app using Electron.',

	init() {

		this.availableOptions.push({
			name: 'ia32',
			type: Boolean,
			default: false,
			description: 'Build for ia32 architecture (see https://www.electron.build/cli)',
		});

		this.availableOptions.push({
			name: 'x64',
			type: Boolean,
			default: false,
			description: 'Build for x64 architecture (see https://www.electron.build/cli)',
		});

		this.availableOptions.push({
			name: 'arm64',
			type: Boolean,
			default: false,
			description: 'Build for arm64 architecture (see https://www.electron.build/cli)',
		});

		this.availableOptions.push({
			name: 'universal',
			type: Boolean,
			default: false,
			description: 'Build for universal binary architecture (see https://www.electron.build/cli)',
		});

		this.availableOptions.push({
			name: 'mac',
			type: Array,
			default: undefined,
			description: 'Build targets for macOS, accepts target list (see https://www.electron.build/configuration/mac)',
		});

		this.availableOptions.push({
			name: 'win',
			type: Array,
			default: undefined,
			description: 'Build targets for Windows, accepts target list (see https://www.electron.build/configuration/win)',
		});

		this.availableOptions.push({
			name: 'linux',
			type: Array,
			default: undefined,
			description: 'Build targets for Linux, accepts target list (see https://www.electron.build/configuration/linux)',
		});

		this.availableOptions.push({
			name: 'publish',
			type: String,
			default: 'never',
			aliases: ['p'],
			description: 'Publish using the specified options: [onTag, onTagOrDraft, always, never]',
		});

		this._super(...arguments);

	},

	run(options) {

		process.env.EMBER_CLI_ELECTRON = true;

		const appId = this.project.pkg.build.appId;

		return this._super(...arguments).then(() => {

			const arch = {
				x64: options.x64,
				arm64: options.arm64,
				universal: options.universal,
			};

			const opts = {
				mac: options.mac,
				win: options.win,
				linux: options.linux,
				publish: options.publish,
			};

			return Builder.build({
				...arch,
				...opts,
				config: {
					asar: true,
					directories: {
						output: "build",
					},
					electronVersion: require('electron/package.json').version,
					extraMetadata: {
						main: "electron/main.js",
					},
					files: [
						"dist/**",
						"electron/**/*.js",
					],
					dmg: {
						background: 'electron/dmg/back.tiff',
						iconSize: 120,
						internetEnabled: true,
						title: "${productName}",
						contents: [
							{ x: 175, y: 340 },
							{ x: 485, y: 340, type: 'link', path: '/Applications' },
						],
					},
					mac: {
						notarize: false,
						darkModeSupport: true,
						hardenedRuntime: true,
						icon: 'electron/mac/icon.png',
						entitlements: 'electron/mac/entitlements.mac.inherit.plist',
					},
					win: {
						icon: 'electron/win/icon.png',
					},
					linux: {
						icon: 'electron/win/icon.png',
					},
					async afterSign(params) {

						if (appId && process.platform === 'darwin') {

							if (APPLE_ID && APPLE_PASSWORD) {

								let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);

								if (fs.existsSync(appPath)) {

									log.info({ appId, appPath }, "notarizing");

									return await Notarizer.notarize({
										tool: 'notarytool',
										appBundleId: appId,
										appPath: appPath,
										appleId: APPLE_ID,
										teamId: APPLE_TEAMID,
										appleIdPassword: APPLE_PASSWORD,
									});

								}

							}

						}

					},
					async afterAllArtifactBuild(params) {

						if (appId && process.platform === 'darwin') {

							if (APPLE_ID && APPLE_PASSWORD) {

								let dmgPath = params.artifactPaths.find(p => p.endsWith(".dmg"));

								if (fs.existsSync(dmgPath)) {

									log.info({ appId, dmgPath }, "notarizing");

									return await Notarizer.notarize({
										tool: 'notarytool',
										appBundleId: appId,
										appPath: dmgPath,
										appleId: APPLE_ID,
										teamId: APPLE_TEAMID,
										appleIdPassword: APPLE_PASSWORD,
									});

								}

							}

						}

					},
				},
			});

		});

	},

});
