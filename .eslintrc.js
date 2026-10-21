'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },
  // Formatting does not match the codebase style, and existing violations are warnings until fixed.
  // Object-literal decorators in these files cannot be parsed by the Babel ESLint parser.
  ignorePatterns: [
    'packages/gridlist/addon/components/gridlist.js',
    'packages/surreal/addon/classes/field/index.js',
    'packages/surreal/addon/classes/model/index.js',
  ],
  rules: {
    'prettier/prettier': 'off',
    'no-undef': 'warn',
    'no-unused-vars': 'warn',
    'ember/classic-decorator-hooks': 'warn',
    'no-redeclare': 'warn',
    'no-constant-condition': 'warn',
    'ember/no-side-effects': 'warn',
    'no-fallthrough': 'warn',
    'no-case-declarations': 'warn',
    'ember/no-observers': 'warn',
    'no-self-assign': 'warn',
    'ember/classic-decorator-no-classic-methods': 'warn',
    'ember/require-super-in-lifecycle-hooks': 'warn',
    'getter-return': 'warn',
    'ember/no-get': 'warn',
    'ember/no-classic-classes': 'warn',
    'ember/no-component-lifecycle-hooks': 'warn',
    'no-dupe-keys': 'warn',
    'no-func-assign': 'warn',
    'no-prototype-builtins': 'warn',
    'no-unsafe-finally': 'warn',
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
      rules: {
        'n/no-unpublished-require': 'warn',
      },
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
      rules: {
        'qunit/no-assert-logical-expression': 'warn',
        'qunit/no-ok-equality': 'warn',
        'qunit/no-conditional-assertions': 'warn',
        'qunit/no-early-return': 'warn',
      },
    },
  ],
};
