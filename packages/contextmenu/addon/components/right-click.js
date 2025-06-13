import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';
import Remote from '@electron/remote';
import Electron from 'electron';

export default class extends Component {

	@service contextmenu;

	@arg model = null;

	@arg menu = null;

	constructor() {

		super(...arguments);

		if (Electron) {
			Remote.getCurrentWindow().webContents.on('context-menu', (event, vars) => {
				return this.contextmenu.show(this, event, vars, this.menu, this.model);
			});
		}

	}

	@action didClick(event) {
		if (event.ctrlKey === true) {
			event.stopPropagation();
			if (Electron) {
				return this.contextmenu.prep(this, event, null, this.menu, this.model);
			} else {
				return this.contextmenu.show(this, event, null, this.menu, this.model);
			}
		}
	}

	@action didCmenu(event) {
		event.stopPropagation();
		if (Electron) {
			return this.contextmenu.prep(this, event, null, this.menu, this.model);
		} else {
			return this.contextmenu.show(this, event, null, this.menu, this.model);
		}
	}

}
