import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class extends Component {

	@inject('-document') document;

	@tracked value = htmlSafe(this.args.value);

	@action didUpdate(element) {
		if (element !== document.activeElement) {
			this.value = htmlSafe(this.args.value);
		}
	}

	@action changed(event) {
		if (this.args.onChangeHtml) {
			this.args.onChangeHtml(event.target.innerHTML);
		}
		if (this.args.onChangeText) {
			this.args.onChangeText(event.target.textContent);
		}
	}

}
