import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@service('-document') document;

	@arg value = '';

	@action didCreate(element) {
		this.element = element;
		element.style.height = 'auto';
		element.style.overflow = 'hidden';
		element.style.height = `${element.scrollHeight}px`;
	}

	@action didChange(element) {
		element.value = this.value;
		element.style.height = 'auto';
		element.style.overflow = 'hidden';
		element.style.height = `${element.scrollHeight}px`;
	}

	@action didInput() {
		this.element.style.height = 'auto';
		this.element.style.overflow = 'hidden';
		this.element.style.height = `${this.element.scrollHeight}px`;
		if (this.args.onChange) {
			this.args.onChange(this.element.value);
		}
	}

	@action didLimit(event) {
		if (event.which !== 13) return true;
		if (this.args.limit === undefined) return true;
		if (this.element.value.split('\n').length < this.args.limit) return true;
		event.preventDefault();
		return false;
	}

}
