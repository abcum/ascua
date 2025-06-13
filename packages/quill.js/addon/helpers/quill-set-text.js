import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service quill;

	compute([name], { text }) {
		return (...passed) => {
			let data = passed.find(v => v instanceof Event === false) || text;
			this.quill.text(name, null, data, 'api');
		};
	}

}
