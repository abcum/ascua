'use strict';

const Filter = require('broccoli-persistent-filter');

class SQLFilter extends Filter {
  constructor(inputNode, options) {
    super(inputNode, options);
    this.extensions = ['sql'];
    this.targetExtension = 'js';
  }

  processString(source) {
    return 'export default ' + JSON.stringify(source) + ';';
  }
}

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, ...arguments);

    app.import('vendor/diffmatchpatch.js');

    app.import('vendor/dmp.js', {
      exports: { dmp: ['default'] },
    });
  },

  setupPreprocessorRegistry(type, registry) {
    if (type === 'parent') {
      registry.add('js', {
        name: 'surrealdb',
        ext: ['sql'],
        toTree(tree) {
          return new SQLFilter(tree);
        },
      });
    }
  },

  contentFor(type) {
    if (type === 'head') {
      return '<link rel="dns-prefetch" href="//surreal.io/">';
    }
  },
};
