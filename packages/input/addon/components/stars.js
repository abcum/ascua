import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@arg min = 1;

	@arg max = 5;

	@arg disabled = false;

	@tracked value = undefined;

	get stars() {
		let b = parseInt(this.min);
		let e = parseInt(this.max);
		return Array(e-b+1).fill().map( (_, n) => {
			return { number: b+n, select: (b+n <= this.value) }
		});
	}

	@action didCreate() {
		this.value = this.args.value;
	}

	@action didChange() {
		this.value = this.args.value;
	}

	@action toggled(value) {

		if (this.disabled) return;

		if (this.value === value) {
			this.value -= 1;
		} else {
			this.value = value;
		}

		if (this.args.onChange) {
			this.args.onChange(value);
		}

	}

}
