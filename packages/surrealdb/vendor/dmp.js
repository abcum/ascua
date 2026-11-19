(function () {
	/* globals define, diff_match_patch */

	function generateModule(name, values) {
		define(name, [], function () {
			'use strict';
			return values;
		});
	}

	generateModule('dmp', {
		default:
			typeof diff_match_patch === 'undefined' ? null : diff_match_patch,
	});
})();
