import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';
import Event from '@ascua/events';
import Quill from 'quill';

import Uploader from '../utils/uploader';
Quill.register('modules/uploader', Uploader, true);

import Import from '../utils/import';
Quill.register('modules/import', Import);

import Insert from '../utils/insert';
Quill.register('modules/insert', Insert, true);

import Resize from '../utils/resize';
Quill.register('modules/resize', Resize, true);

import Image from '../utils/image';
Quill.register(Image, true);

import Video from '../utils/video';
Quill.register(Video, true);

const history = {
	delay: 1000,
	maxStack: 1000,
	userOnly: true,
};

const toolbar = [
	[{ 'header': [1, 2, 3, 4, false] }],
	['bold', 'italic', 'underline', 'strike'],
	[{ 'color': [] }, { 'background': [] }],
	[{ 'align': [] }, { 'list': 'ordered' }, { 'list': 'bullet' }],
	['blockquote', 'image', 'video', 'code-block'],
	['link'],
	['clean']
];

export default class extends Component {

	@service quill;

	@arg name = null;
	@arg delta = null;
	@arg value = null;

	@arg bounds = null;
	@arg debug = 'warn';
	@arg formats = null;
	@arg placeholder = '';
	@arg readOnly = false;
	@arg scrollingContainer = null;
	@arg theme = 'snow';
	@arg toolbar = toolbar;
	@arg history = history;
	@arg clipboard = {};
	@arg keyboard = {};
	@arg import = {};
	@arg insert = {};
	@arg resize = {};

	@action didCreate(element) {

		if (!Quill) return;

		// Instantiate the Quill editor instance.

		this.instance = new Quill(element, {
			bounds: this.bounds,
			debug: this.debug,
			formats: this.formats,
			modules: {
				clipboard: this.clipboard,
				history: this.history,
				keyboard: this.keyboard,
				toolbar: this.toolbar,
				import: this.import,
				insert: { handler: this.insert },
				resize: this.resize,
			},
			placeholder: this.placeholder,
			readOnly: this.readOnly,
			scrollingContainer: this.scrollingContainer,
			theme: this.theme,
		});

		// Set the initial quill contents if specified.

		if (this.delta) {
			this.instance.setContents(this.delta, 'silent');
		}

		if (this.value) {
			let delta = this.instance.clipboard.convert({ html: this.value });
			this.instance.setContents(delta, 'silent');
		}

		// Listen to events and call any specified actions.

		this.instance.on('text-change', (delta, oldDelta, source) => {
			return element.dispatchEvent(new Event('text-change', {
				detail: { instance: this.instance, delta, oldDelta, source }
			}));
		});

		this.instance.on('selection-change', (range, oldRange, source) => {
			return element.dispatchEvent(new Event('selection-change', {
				detail: { instance: this.instance, range, oldRange, source }
			}));
		});

		// Listen to events for syncing with the quillable service.

		this.quill.register(this);

		this.instance.on('text-change', (delta, oldDelta, source) => {
			this.quill.update(this.name, this.instance, delta, oldDelta, source);
		});

		this.instance.on('selection-change', (delta, oldDelta, source) => {
			this.quill.select(this.name, this.instance, delta, oldDelta, source);
		});

		// Listen to events for getting full content or length.

		this.instance.on('text-change', (delta, oldDelta, source) => {
			if (this.args.onChangeText) {
				this.args.onChangeText(this.instance.getText());
			}
			if (this.args.onChangeHtml) {
				this.args.onChangeHtml(this.instance.container.firstChild.innerHTML);
			}
		});

	}

	@action didChange(element) {

		if (!Quill) return;

		let delta = this.instance.clipboard.convert({ html: this.value });

		this.instance.setContents(delta, 'silent');

	}

	@action willDelete() {

		if (!Quill) return;

		this.quill.unregister(this);

	}

}
