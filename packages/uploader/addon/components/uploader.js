import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';

export default class extends Component {

	counter = 0;

	@arg clickable = true;

	@tracked waiting = false;

	@tracked loading = false;

	@tracked dropping = false;

	@action setup(element) {
		this.element = element;
	}

	@action didClick(event) {
		if (this.clickable) {
			const input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.onchange = this.didInput;
			input.click();
		}
	}

	@action didInput(event) {
		this.into(event.target.files);
	}

	@action didDragOver(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	@action didDragEnter(event) {
		this.counter++;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			if (event.dataTransfer.types.includes('Files')) {
				if (this.counter > 0) {
					this.dropping = true;
				}
			}
		}
	}

	@action didDragLeave(event) {
		this.counter--;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			if (event.dataTransfer.types.includes('Files')) {
				if (this.counter < 1) {
					this.dropping = false;
				}
			}
		}
	}

	@action didDrop(event) {
		this.dropping = false;
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			if (event.dataTransfer.files.length > 0) {
				return this.into(event.dataTransfer.files);
			}
		}
	}

	into(files) {

		let ms = [].concat(this.args.mimetypes).filter(Boolean);
		let es = [].concat(this.args.extensions).filter(Boolean);

		if (this.args.onFiles) {
			this.args.onFiles(files);
		}

		for (let i=0; i<files.length; i++) {

			let f = files[i];

			let ext = f.name.split('.').pop()?.toLowerCase();
			if (es.length && !es.includes(ext)) {
				return;
			}

			if (ms.length && ms.includes(f.type) === false) {
				return;
			}

			let r = new FileReader();

			if (this.args.onDrop) {
				this.args.onDrop(f);
			}

			if (this.args.onOpen) {
				this.args.onOpen(f);
			}

			r.onload = e => {
				this.waiting = true;
				this.loading = false;
				if (this.args.onLoad) {
					this.args.onLoad(e, f);
				}
			}

			r.onerror = e => {
				this.waiting = true;
				this.loading = false;
				if (this.args.onError) {
					this.args.onError(e, f);
				}
			}

			r.onprogress = e => {
				this.waiting = false;
				this.loading = true;
				if (this.args.onProgress) {
					this.args.onProgress(e, f);
				}
			}

			r.readAsBinaryString(f);

		}

	}

}
