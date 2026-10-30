'use strict';

const fs = require('fs');
const path = require('path');

const transform = {
	using: [{ transformation: 'babel' }]
};

module.exports = {

	name: require('./package').name,

	included(app) {

		this.opts = app.options.dayjs || {
			locales: ['en-gb'],
		};

		this._super.included.apply(this, ...arguments);

		app.import('node_modules/dayjs/dayjs.min.js');
		app.import('node_modules/dayjs/plugin/calendar.js');
		app.import('node_modules/dayjs/plugin/isoWeek.js');
		app.import('node_modules/dayjs/plugin/localeData.js');
		app.import('node_modules/dayjs/plugin/localizedFormat.js');
		app.import('node_modules/dayjs/plugin/relativeTime.js');
		app.import('node_modules/dayjs/plugin/updateLocale.js');
		app.import('node_modules/dayjs/plugin/utc.js');

		app.import('vendor/dayjs/instance.js', transform);
		app.import('vendor/dayjs/weekdays.js', transform);
		app.import('vendor/dayjs/workdays.js', transform);
		app.import('vendor/dayjs/override.js', transform);

		app.import('vendor/dayjs.js', {
			exports: { moment: ['default'] }
		});

		if (this.opts.locales) {
			[].concat(this.opts.locales).forEach(l => {
				app.import('node_modules/dayjs/locale/'+l+'.js', transform);
				if (fs.existsSync(path.join(__dirname, 'vendor/dayjs/locale', l+'.js'))) {
					app.import('vendor/dayjs/locale/'+l+'.js', transform);
				}
			});
		}

		app.import('vendor/dayjs/default.js', transform);

	},

};
