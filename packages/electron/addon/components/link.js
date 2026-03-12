import Component from '@glimmer/component';
import { action } from '@ember/object';
import Remote from '@electron/remote';
import Electron from 'electron';

export default class extends Component {

	@action didClick(event) {

		if (!Electron) {
			if (this.args.download) {
				event.stopPropagation();
				event.preventDefault();
				fetch(this.args.url)
					.then(r => r.blob())
					.then(blob => {
						let url = URL.createObjectURL(blob);
						let a = document.createElement('a');
						a.href = url;
						a.download = this.args.download;
						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(url);
					});
			}
			return;
		}

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
