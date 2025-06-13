import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { get } from '@ember/object';

export default class extends Component {

	@service('-document') document;

	@tracked top = 0;

	@tracked left = 0;

	@tracked search = '';

	@tracked value = [];

	@tracked options = [];

	@tracked selected = [];

	@tracked display = false;

	@action open() {
		this.display = true;
	}

	@action close() {
		this.display = false;
	}

	@action focus(element) {
		this.search = '';
		element.focus();
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

	@action didEnter(element) {
		this.element = element;
	}

	@action didValue() {
		if (Array.isArray(this.args.value)) {
			Promise.all(this.args.value).then(v => {
				this.value = v;
			});
		} else {
			Promise.resolve(this.args.value).then(v => {
				this.value = [v];
			});
		}
	}

	@action register(el, value, label) {
		setTimeout(() => {
			Promise.resolve(value).then(value => {
				this.options.addObject({
					el, label, value,
				});
			});
		});
	}

	@action unregister(el, value, label) {
		setTimeout(() => {
			Promise.resolve(value).then(value => {
				this.options = this.options.filter(opt => {
					return opt.el !== el;
				});
			});
		});
	}

	@action reregister(el, value, label) {
		setTimeout(() => {
			Promise.resolve(value).then(value => {
				this.options = this.options.map(opt => {
					return opt.el !== el ? opt : {
						el, label, value,
					};
				});
			});
		});
	}

	@action async changed(value) {

		if (this.args.multiple) {
			if (this.value.includes(value)) {
				value = this.value.removeObject(value);
			} else {
				value = this.value.addObject(value);
			}
		}

		if (this.args.onSelect) {
			this.args.onSelect(value);
		}

		this.close();

	}

	get label() {

		if (this.args.label !== undefined) {

			let label = this.value.filter(Boolean).map(v => {
				return this.args.label ? get(v, this.args.label) : v;
			});

			return label.join(', ');

		} else {

			let label = this.options.reduce((a, o, k) => {
				if (this.value.includes(o.value)) {
					a.push(o.label);
				}
				return a;
			}, []);

			return label.join(', ');

		}

	}

}
