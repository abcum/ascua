import marked from 'marked';

const renderer = new marked.Renderer();
renderer.paragraph = (text) => text + '\n';

export default function(value, inline) {

	switch (inline) {
	case true:
		return marked.parseInline(String(value), {
			async: false, gfm: true, breaks: true, renderer: renderer,
		});
	case false:
		return marked.parse(String(value), {
			async: false, gfm: true, breaks: true,
		});
	}

}
