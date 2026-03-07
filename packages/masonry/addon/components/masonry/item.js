import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class extends Component {

	@action didCreate(el) {

		this.args.observer.observe(el, {
			childList: true,
			subtree: true,
		});

		el.querySelectorAll('img').forEach(img => {
			if (!img.complete) {
				img.addEventListener('load', () => this.args.reload());
				img.addEventListener('error', () => this.args.reload());
			}
		});

		this.args.reload();

	}

}
