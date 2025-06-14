'use strict';

module.exports = function (environment) {

	let ENV = {

		environment,
		rootURL: '/',
		modulePrefix: 'ascua',
		locationType: 'history',

		surreal: {
			ns: 'test',
			db: 'test',
		},

		stripe: {
			publishableKey: 'pk_test_SWarCDaast79iYO0YdTILYos',
		},

		codemirror: {
			includeTags: true,
			includeComments: true,
			includeBrackets: true,
			includeWhitespace: true,
			modes: ["htmlmixed", "css", "sass", "javascript", "markdown", "handlebars"],
			themes: ["base16-dark", "base16-light", "bespin", "dracula", "eclipse"],
		},

		APP: {
			BINDINGS: false,
			LOG_RESOLVER: false,
			LOG_TRANSITIONS: false,
			LOG_VIEW_LOOKUPS: false,
			LOG_ACTIVE_GENERATION: false,
			LOG_TRANSITIONS_INTERNAL: false,
			RAISE_ON_DEPRECATION: false,
			LOG_STACKTRACE_ON_DEPRECATION: false,
		},

		EmberENV: {
			EXTEND_PROTOTYPES: {
				Array: true,
				Date: false,
			},
			FEATURES: {
				EMBER_METAL_TRACKED_PROPERTIES: true,
			},
		},

	};

	if (environment === 'test') {
		ENV.APP.autoboot = false;
		ENV.locationType = 'none';
		ENV.APP.rootElement = '#ember-testing';
	}

	if (environment === 'development') {
		ENV.rootURL = '/';
		ENV.surreal.uri = 'http://localhost:8000';
	}

	if (environment === 'production') {
		ENV.locationType = 'hash';
		ENV.rootURL = '/ascua/';
	}

	return ENV;

};
