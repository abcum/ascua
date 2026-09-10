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

	// `addObject`/`removeObject` reached `items` only through Ember's Array
	// prototype extensions (`EXTEND_PROTOTYPES.Array`), deprecated and removed
	// in ember-source 6.0. `items` is a plain array, not `@tracked` — nothing
	// here depends on notifying a reader, so a native push/splice is exactly
	// equivalent.

	@action didCreate() {
		let items = this.contextmenu.items;
		if (!items.includes(this)) items.push(this);
	}

	@action willDelete() {
		let items = this.contextmenu.items;
		let i = items.indexOf(this);
		if (i > -1) items.splice(i, 1);
	}

}
