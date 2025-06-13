import Component from '@ember/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	@service facebook;

	@arg adapt_container_width = true;
	@arg height = undefined;
	@arg hide_cover = false;
	@arg hide_cta = false;
	@arg href = undefined;
	@arg lazy = false;
	@arg show_facepile = true;
	@arg small_header = false;
	@arg tabs = 'timeline';
	@arg width = undefined;

	@action async didCreate(element) {
		const FB = await this.facebook.load();
		FB.XFBML.parse(element);
	}

	@action async didChange(element) {
		const FB = await this.facebook.load();
		FB.XFBML.parse(element);
	}

}
