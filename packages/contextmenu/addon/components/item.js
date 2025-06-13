import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@service contextmenu;

	@arg type = 'normal';

	@arg role = null;

	@arg label = null;

	@arg enabled = true;

	@arg visible = true;

	@arg checked = false;

	@arg sublabel = null;

	@arg accelerator = null;

	@arg click = undefined;

	@action didClick() {
		if (this.args.click) {
			this.args.click();
		}
	}

	@action didMouse() {
		setTimeout(() => {
			this.contextmenu.hide();
		});
	}

	@action didCreate() {
		this.contextmenu.items.addObject(this);
	}

	@action willDelete() {
		this.contextmenu.items.removeObject(this);
	}

}
