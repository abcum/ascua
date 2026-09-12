import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { clampToViewport } from '@ascua/decorators';
import Electron from 'electron';

export default class extends Component {

	@service contextmenu;

	visible = !Electron;

	@action didRender(element, x, y) {

		let w = element.offsetWidth;
		let h = element.offsetHeight;

		({ left: x, top: y } = clampToViewport(x, y, w, h));

		element.style.top = `${y}px`;
		element.style.left = `${x}px`;

	}

}
