'use strict';

module.exports = {
	extends: 'recommended',
	rules: {
		// Existing violations are warnings until they are fixed.
		'no-at-ember-render-modifiers': 'warn',
		'no-invalid-interactive': 'warn',
		'require-presentational-children': 'warn',
		'no-passed-in-event-handlers': 'warn',
		'no-builtin-form-components': 'warn',
		'require-input-label': 'warn',
		'no-redundant-fn': 'warn',
		'no-unnecessary-curly-parens': 'warn',
		'require-valid-alt-text': 'warn',
		'no-nested-splattributes': 'warn',
		'no-duplicate-id': 'warn',
		'no-forbidden-elements': 'warn',
		'no-unknown-arguments-for-builtin-components': 'warn',
		'no-whitespace-for-layout': 'warn',
		'require-iframe-title': 'warn',
	'block-indentation': 'tab',
		'attribute-indentation': false,
		'no-implicit-this': {
			allow: [
				'now', 'utc', 'uuid', 'console',
				'history-back', 'history-forward', 'reload',
				'route-url', 'route-name', 'route-path', 'route-vars',
			]
		},
		'no-curly-component-invocation': {
			allow: [
				'now', 'utc', 'uuid', 'console',
				'history-back', 'history-forward', 'reload',
				'route-url', 'route-name', 'route-path', 'route-vars',
			]
		},
	}
};
