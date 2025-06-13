import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {

	@service quill;

	compute([name], { delta }) {
		return (...passed) => {
			let data = passed.find(v => v instanceof Event === false) || delta;
			this.quill.insert(name, null, data, 'api');
		};
	}

}
