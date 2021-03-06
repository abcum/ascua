(function() {

	'use strict';

	/* globals moment */

	moment.prototype._add = moment.prototype.add;

	moment.prototype.add = function(val, period) {
		switch (period) {
		case 'weekday':
		case 'weekdays':
			return this.addWeekdays(val);
		case 'workday':
		case 'workdays':
			return this.addWorkdays(val);
		default:
			return this._add(...arguments);
		}
	};

	moment.prototype._subtract = moment.prototype.subtract;

	moment.prototype.subtract = function(val, period) {
		switch (period) {
		case 'weekday':
		case 'weekdays':
			return this.subtractWeekdays(val);
		case 'workday':
		case 'workdays':
			return this.subtractWorkdays(val);
		default:
			return this._subtract(...arguments);
		}
	};

}).call(this);
