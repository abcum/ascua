import marked from 'marked';

const renderer = new marked.Renderer();
// Ignore all code blocks
renderer.code = () => '';
// Ignore all images
renderer.image = () => '';
// Convert breaks to new lines
renderer.br = () => '\n';
// Convert html to plain text
renderer.html = (token) => token.text;
// Convert codespans to plain text
renderer.codespan = (token) => token.text;
// Convert all other types recursively
renderer.heading = function(token) {
	return this.parser.parseInline(token.tokens) + '\n';
};
renderer.link = function(token) {
	return this.parser.parseInline(token.tokens) + ` (${token.href})`;
};
renderer.paragraph = function(token) {
	return this.parser.parseInline(token.tokens) + '\n';
};
renderer.strong = function(token) {
	return this.parser.parseInline(token.tokens);
};
renderer.em = function(token) {
	return this.parser.parseInline(token.tokens);
};

export default function(value) {

	return marked.parse(String(value), {
		async: false, renderer: renderer,
	}).replace(/&#(\d+);/g, (m, dec) => {
		return String.fromCharCode(dec);
	}).replace(/&nbsp;/g, () => {
		return ' ';
	}).replace(/<[^>]*>/g, () => {
		return '';
	}).replace(/&[^;]*;/g, () => {
		return '';
	});

}
