(function () {
	/* globals define, Surreal */

	function generateModule(name, values) {
		define(name, [], function () {
			'use strict';
			return values;
		});
	}

	generateModule('surrealdb', {
		default: typeof Surreal === 'undefined' ? null : Surreal,
	});
})();
