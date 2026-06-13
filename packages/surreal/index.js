'use strict';

const Filter = require('broccoli-persistent-filter');

class SQLFilter extends Filter {

	constructor(inputNode, options) {
		super(inputNode, options);
		this.extensions = ['sql'];
		this.targetExtension = 'js';
	}

	processString(source) {
		return "export default " + JSON.stringify(source) + ";";
	}

}

module.exports = {

	name: require('./package').name,

	included(app) {

		this._super.included.apply(this, ...arguments);

		// The official `surrealdb` SDK is an ES module and is
		// bundled automatically via ember-auto-import, so it no
		// longer needs importing as a vendored global. We keep
		// the diff-match-patch globals used by the diff/patch
		// classes for record modification.

		app.import('vendor/diffmatchpatch.js');

		app.import('vendor/dmp.js', {
			exports: { dmp: ['default'] }
		});

	},

	setupPreprocessorRegistry(type, registry) {
		if (type === "parent") {
			registry.add('js', {
				name: 'surreal',
				ext: ['sql'],
				toTree(tree) {
					return new SQLFilter(tree);
				}
			});
		}
	},

	contentFor(type) {

		if (type === 'head') {
			return '<link rel="dns-prefetch" href="//surreal.io/">';
		}

	},

};
