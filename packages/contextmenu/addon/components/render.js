import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import Electron from 'electron';

export default class extends Component {

	@service contextmenu;

	visible = !Electron;

	@action didRender(element, x, y) {

		let w = element.offsetWidth;
		let h = element.offsetHeight;

		while (x + w > window.innerWidth - 30) x--;
		while (y + h > window.innerHeight - 30) y--;

		element.style.top = `${y}px`;
		element.style.left = `${x}px`;

	}

}
