import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { typeOf } from '@ember/utils';

export default class extends Helper {

	@service contextmenu;

	compute([name], { model }) {
		return (event, ...params) => {

			model = params.length ? params[0] : null;

			params.forEach(param => {
				if (typeOf(param) === 'instance') {
					model = param;
				}
			});

			return this.contextmenu.show(event, name, model);

		};
	}

}
