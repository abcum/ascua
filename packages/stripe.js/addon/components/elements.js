import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import stripe from '@ascua/stripe.js';
import config from '@ascua/config';

export default class extends Component {

	@tracked instance;

	@tracked elements;

	@action setup(element) {

		if (this.args.stripe !== undefined) {
			this.elements = this.args.stripe.elements();
		}

		if (this.args.stripe === undefined) {
			stripe.instance.then(stripe => {
				this.elements = stripe.elements();
			});
		}

	}

}
