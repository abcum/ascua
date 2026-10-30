'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {

	const app = new EmberApp(defaults, {
		dayjs: {
			locales: ['en-gb', 'de', 'fr', 'es', 'pt', 'ja'],
		},
		prism: {
			copyToClipboard: true,
			languages: [
				'css', 'scss', 'bash',
				'typescript', 'javascript', 'json',
				'handlebars', 'markup-templating',
			],
		},
		codemirror: {
			includeTags: true,
			includeComments: true,
			includeBrackets: true,
			includeWhitespace: true,
			modes: ["htmlmixed", "css", "sass", "javascript", "markdown", "handlebars"],
			themes: ["base16-dark", "base16-light", "bespin", "dracula", "eclipse"],
		},
		snippetRegexes: {
			begin: /<Example\s@name="(\S+)"[^>]*>/,
			end: /<\/Example>/,
		},
		snippetSearchPaths: ['app'],
		includeFileExtensionInSnippetNames: false,
	});

	return app.toTree();

};
