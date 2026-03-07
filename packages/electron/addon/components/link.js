import Component from '@glimmer/component';
import { action } from '@ember/object';
import Remote from '@electron/remote';
import Electron from 'electron';

export default class extends Component {

	@action didClick(event) {

		if (!Electron) return;

		if (this.args.download) {
			Electron.ipcRenderer.invoke('download-file', {
				url: this.args.url,
				filename: this.args.download,
			});
		} else {
			Remote.shell.openExternal(this.args.url);
		}

		event.stopPropagation();

		event.preventDefault();

		return false;

	}

}
