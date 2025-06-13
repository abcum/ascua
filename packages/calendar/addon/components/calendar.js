import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@service('-document') document;

	@tracked top = 0;

	@tracked left = 0;

	@tracked display = false;

	@tracked current = undefined;

	@arg format = "Do MMMM YYYY";

	@arg default = "Select a date";

	@action open() {
		this.display = true;
	}

	@action close() {
		this.display = false;
	}

	@action place(event) {
		this.popup(event.target.parentElement);
	}

	@action popup(element) {

		let w = element.offsetWidth;
		let h = element.offsetHeight;
		let t = this.element.getBoundingClientRect().top - 5;
		let l = this.element.getBoundingClientRect().left - 5;

		while (l + w > window.innerWidth - 30) l--;
		while (t + h > window.innerHeight - 30) t--;

		this.left = l; this.top = t;

		setTimeout(() => {

			let w = element.offsetWidth;
			let h = element.offsetHeight;
			let t = this.element.getBoundingClientRect().top - 5;
			let l = this.element.getBoundingClientRect().left - 5;

			while (l + w > window.innerWidth - 30) l--;
			while (t + h > window.innerHeight - 30) t--;

			this.left = l; this.top = t;

		});

	}

	@action didCreate(element) {
		this.element = element;
	}

	get value() {
		switch (true) {
			case this.args.value && this.args.value instanceof Date === true:
				return this.args.value;
			case this.args.value && this.args.value instanceof Date === false:
				return new Date(this.args.value);
			default:
				return undefined;
		}
	}

	get pivot() {
		switch (true) {
			case this.current !== undefined:
				return this.current;
			case this.value !== undefined:
				return this.value;
			default:
				return new Date();
		}
	}

}
