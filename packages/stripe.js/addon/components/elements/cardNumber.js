import Element from './element';

export default class extends Element {

	type = 'cardNumber';

	get opts() {
		return {
			classes: this.args.classes,
			style: this.args.style,
			placeholder: this.args.placeholder,
			disabled: this.args.disabled || false,
		}
	}

}
