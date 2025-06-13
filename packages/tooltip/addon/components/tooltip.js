import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import position from '../utils/position';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@service('-document') document;

	@arg side = 's';

	@arg show = 'hover';

	@arg hide = 'hover';

	@tracked enabled = false;

	@tracked visible = false;

	constructor() {

		super(...arguments);

		this.openHandler = this.open.bind(this);

		this.closeHandler = this.close.bind(this);

	}

	@action didCreate(element) {

		if (typeof FastBoot !== 'undefined') return;

		this.target = this.args.target || element.parentNode;

		this.show.split(' ').forEach(e => {
			switch (e) {
				case 'click':
					return this.target.addEventListener('click', this.openHandler);
				case 'hover':
					return this.target.addEventListener('mouseenter', this.openHandler);
			}
		});

		this.hide.split(' ').forEach(e => {
			switch (e) {
				case 'click':
					return document.addEventListener('mousedown', this.closeHandler);
				case 'hover':
					return this.target.addEventListener('mouseleave', this.closeHandler);
			}
		});

	}

	@action willDelete() {

		if (typeof FastBoot !== 'undefined') return;

		this.show.split(' ').forEach(e => {
			switch (e) {
				case 'click':
					return this.target.removeEventListener('click', this.openHandler);
				case 'hover':
					return this.target.removeEventListener('mouseenter', this.openHandler);
			}
		});

		this.hide.split(' ').forEach(e => {
			switch (e) {
				case 'click':
					return document.removeEventListener('mousedown', this.closeHandler);
				case 'hover':
					return this.target.removeEventListener('mouseleave', this.closeHandler);
			}
		});

	}

	@action open() {
		this.visible = false;
		this.enabled = true;
	}

	@action close() {
		this.visible = false;
		this.enabled = false;
	}

	@action style(element) {

		let e = { // element
			t: this.target.getBoundingClientRect().top,
			l: this.target.getBoundingClientRect().left,
			w: this.target.offsetWidth,
			h: this.target.offsetHeight,
		};

		let t = { // tooltip
			w: element.offsetWidth,
			h: element.offsetHeight,
		}

		let p = position(this.side, e, t);

		Object.assign(element.style, {
			top: `${p.t}px`,
			left: `${p.l}px`,
		});

		this.visible = true;

	}

}
