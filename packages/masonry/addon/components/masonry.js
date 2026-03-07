import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';
import Masonry from 'masonry.js';

export default class extends Component {

	@tracked masonry = undefined;

	observer = new MutationObserver(this.reload);

	@arg columnWidth = undefined;
	@arg fitWidth = false;
	@arg gutter = 0;
	@arg horizontalOrder = false;
	@arg originLeft = true;
	@arg originTop = true;
	@arg percentPosition = false;
	@arg resize = true;
	@arg stagger = 0;
	@arg transitionDuration = 0;

	@action didCreate(element) {

		this.masonry = new Masonry(element, {
			itemSelector: 'app-masonry-item',
			columnWidth: this.columnWidth,
			fitWidth: this.fitWidth,
			horizontalOrder: this.horizontalOrder,
			gutter: this.gutter,
			originLeft: this.originLeft,
			originTop: this.originTop,
			percentPosition: this.percentPosition,
			resize: this.resize,
			stagger: this.stagger,
			transitionDuration: this.transitionDuration,
		});

	}

	@action didChange(element) {

		if (!this.masonry) return;

		this.masonry.reloadItems();

		this.masonry.layout();

	}

	@action willDestroy() {

		if (!this.masonry) return;

		this.masonry.destroy();

	}

	@action didScroll(element) {

		if (!this.masonry) return;

		let el = element.target;

		if (el.scrollHeight - el.scrollTop - el.offsetHeight < 1) {
			if (typeof this.args.model.loadmore === 'function') {
				this.args.model.loadmore(this.args.model.length);
			}
		}

	}

	@action reload(mutations) {

		if (!this.masonry) return;

		if (mutations) {
			for (let mutation of mutations) {
				if (mutation.type == 'childList') {
					[].forEach.call(mutation.addedNodes, child => {
						this.#observeImages(child);
					})
				}
			}
		}

		this.masonry.reloadItems();

		this.masonry.layout();

	}

	#observeImages(node) {

		let relayout = () => {
			this.masonry.reloadItems();
			this.masonry.layout();
		};

		let observe = (img) => {
			if (img.complete) return;
			img.addEventListener('load', relayout);
			img.addEventListener('error', relayout);
		};

		if (node.tagName === 'IMG') {
			observe(node);
		} else if (node.querySelectorAll) {
			node.querySelectorAll('img').forEach(observe);
		}

	}

}
