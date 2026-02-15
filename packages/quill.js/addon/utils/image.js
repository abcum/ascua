import Quill from 'quill';

const BlockEmbed = Quill.import('blots/block/embed');

export default class Image extends BlockEmbed {

	static create(value) {
		let node = super.create(value);
		node.setAttribute('src', value);
		node.setAttribute('width', '100%');
		return node;
	}

	static value(domNode) {
		return domNode.getAttribute('src');
	}

}

Image.blotName = 'image';
Image.tagName = 'IMG';
