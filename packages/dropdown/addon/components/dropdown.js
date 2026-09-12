import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { get } from '@ember/object';
import { clampToViewport } from '@ascua/decorators';

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

		({ left: this.left, top: this.top } = clampToViewport(l, t, w, h));

		setTimeout(() => {

			let w = element.offsetWidth;
			let h = element.offsetHeight;
			let t = this.element.getBoundingClientRect().top - 5;
			let l = this.element.getBoundingClientRect().left - 5;

			({ left: this.left, top: this.top } = clampToViewport(l, t, w, h));

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
				this.options = [...this.options, { el, label, value }];
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

	// Two values that both represent the same record can be different object
	// instances - e.g. one fetched via the model being edited, the other via
	// a different relation used to build the option list - so a multi-select
	// toggle can't rely on `===`/`Array#includes`. Records expose a stable
	// `id`; anything else (a plain string/number option) still compares by
	// its own identity, matching the previous behaviour for those.
	//
	// Read `value.id` directly rather than testing `'id' in value` first:
	// these are store proxies, and `in` doesn't see `id` on at least some of
	// them (verified - `in` reports false while `.id` itself resolves fine),
	// so a presence check silently disabled the id-based comparison for
	// exactly the objects it exists to handle.
	#key(value) {
		if (!value || typeof value !== 'object') return value;
		let id = value.id;
		return id === undefined ? value : String(id);
	}

	@action includes(value) {
		let key = this.#key(value);
		return this.value.some(v => this.#key(v) === key);
	}

	@action async changed(value) {

		if (this.args.multiple) {
			if (this.includes(value)) {
				let key = this.#key(value);
				this.value = this.value.filter(v => this.#key(v) !== key);
			} else {
				this.value = [...this.value, value];
			}
			value = this.value;
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
