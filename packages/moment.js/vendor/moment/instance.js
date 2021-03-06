(function() {

	'use strict';

	/* globals moment */

	moment.prototype.instance = function(isoweekday, occurence) {
		switch (occurence) {
		case 1:
			return this.firstInstanceOf(isoweekday);
		case 2:
			return this.secondInstanceOf(isoweekday);
		case 3:
			return this.thirdInstanceOf(isoweekday);
		case 4:
			return this.fourthInstanceOf(isoweekday);
		default:
			return this.lastInstanceOf(isoweekday);
		}
	};

	moment.prototype.firstInstanceOf = function(isoweekday) {
		let val = this.startOf('month');
		while (val.isoWeekday() !== isoweekday) {
			val = val.add(1, 'day');
		}
		return val;
	};

	moment.prototype.secondInstanceOf = function(isoweekday) {
		let val = this.startOf('month').add(1, 'week');
		while (val.isoWeekday() !== isoweekday) {
			val = val.add(1, 'day');
		}
		return val;
	};

	moment.prototype.thirdInstanceOf = function(isoweekday) {
		let val = this.startOf('month').add(2, 'week');
		while (val.isoWeekday() !== isoweekday) {
			val = val.add(1, 'day');
		}
		return val;
	};

	moment.prototype.fourthInstanceOf = function(isoweekday) {
		let val = this.startOf('month').add(3, 'week');
		while (val.isoWeekday() !== isoweekday) {
			val = val.add(1, 'day');
		}
		return val;
	};

	moment.prototype.lastInstanceOf = function(isoweekday) {
		let val = this.endOf('month');
		while (val.isoWeekday() !== isoweekday) {
			val = val.subtract(1, 'day');
		}
		return val;
	};

})();
