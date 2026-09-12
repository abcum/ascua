/* global Electron */
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {

	get width() {
		return this.args.width || 600;
	}

	get height() {
		return this.args.height || 400;
	}

	@action didClick(event) {

		event.preventDefault();

		event.stopPropagation();

		const l = (screen.width / 2) - (this.width / 2);
		const t = (screen.height / 2) - (this.height / 2);

		window.open(this.href, null, `status=no, titlebar=no, toolbar=no, width=${this.width}, height=${this.height}, top=${t}, left=${l}`);

		return false;

	}

}
