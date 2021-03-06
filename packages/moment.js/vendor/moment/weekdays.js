(function() {

	'use strict';

	/* globals moment */

	const defaultWorkDays = [1, 2, 3, 4, 5];

	moment.prototype.isWeekday = function() {
		let locale = this.localeData();
		let days = locale._workDays || defaultWorkDays;
		return days.includes( this.isoWeekday() ) === true;
	};

	moment.prototype.isWeekend = function() {
		let locale = this.localeData();
		let days = locale._workDays || defaultWorkDays;
		return days.includes( this.isoWeekday() ) === false;
	};

	moment.prototype.prevWeekday = function() {
		let x = this;
		while (true) {
			x = x.subtract(1, 'day');
			if (x.isWeekday()) return x;
		}
	};

	moment.prototype.nextWeekday = function() {
		let x = this;
		while (true) {
			x = x.add(1, 'day');
			if (x.isWeekday()) return x;
		}
	};

	moment.prototype.diffWeekdays = function(compare) {

		let diff = 0;
		let d1 = this.clone();
		let d2 = compare.clone();
		let beg = d1 < d2 ? d1 : d2;
		let end = d2 > d1 ? d2 : d1;

		if (beg.format('DD/MM/YYYY') === end.format('DD/MM/YYYY')) {
			return diff;
		}

		while (beg < end) {
			if (beg.isWeekday()) {
				diff++;
			}
			beg.add(1, 'd');
		}

		return diff;

	};

	moment.prototype.changeWeekday = function(number) {
		let sign = number < 0 ? -1 : 1;
		let days = Math.abs(number);
		let x = this;
		while (days > 0) {
			x = x.add(sign, 'days');
			if (x.isWeekday()) {
				days--;
			}
		}
		return x;
	};

	moment.prototype.addWeekdays = function(number) {
		return this.changeWeekday(+number);
	};

	moment.prototype.subtractWeekdays = function(number) {
		return this.changeWeekday(-number);
	};

})();
