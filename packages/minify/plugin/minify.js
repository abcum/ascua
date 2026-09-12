'use strict';

const Filter = require('broccoli-persistent-filter');
const minify = require('html-minifier-terser').minify;

module.exports = class Minify extends Filter {

	constructor(inputNode, conf, opts) {

		super(inputNode, {
			extensions: ['html'],
			targetExtension: 'html',
		});

		this.conf = conf;
		this.opts = opts;

	}

	processString(string) {

		return minify(string, this.opts);

	}

};
