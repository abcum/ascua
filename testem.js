'use strict';

module.exports = {
	test_page: 'tests/index.html?hidepassed',
	disable_watching: true,
	launch_in_ci: ['Chrome'],
	launch_in_dev: ['Chrome'],
	browser_start_timeout: 120,
	browser_args: {
		// Chrome rather than Chromium: it is what both the GitHub ubuntu runners
		// and a normal macOS dev machine actually have installed.
		Chrome: {
			ci: [
				'--headless=new',
				'--no-sandbox',
				'--mute-audio',
				'--disable-gpu',
				'--window-size=1440,900',
				'--disable-dev-shm-usage',
				'--remote-debugging-port=0',
			],
			dev: [
				'--headless=new',
				'--mute-audio',
				'--disable-gpu',
				'--window-size=1440,900',
				'--remote-debugging-port=0',
			],
		},
	},
};
