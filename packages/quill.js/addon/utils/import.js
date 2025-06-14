export default class Import {

	constructor(quill) {

		this.quill = quill;

		this.didDrop = this.didDrop.bind(this);
		this.didPaste = this.didPaste.bind(this);

		this.quill.root.addEventListener('drop', this.didDrop, false);
		this.quill.root.addEventListener('paste', this.didPaste, false);
		this.quill.getModule('toolbar').addHandler('image', this.didImage);
		this.quill.getModule('toolbar').addHandler('video', this.didVideo);

	}

	didImage(e) {

		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.onchange = () => {
			[].forEach.call(input.files, file => {
				this.quill.getModule('insert').insert(file);
			});
		}
		input.click();

	}

	didVideo(e) {

		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'video/*');
		input.onchange = () => {
			[].forEach.call(input.files, file => {
				this.quill.getModule('insert').insert(file);
			});
		}
		input.click();

	}

	didPaste(e) {

		if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
			[].forEach.call(e.clipboardData.files, file => {
				this.quill.getModule('insert').insert(file);
			});
		}

	}

	didDrop(e) {

		if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {

			if (document.caretRangeFromPoint) {
				const sel = document.getSelection();
				const rng = document.caretRangeFromPoint(e.clientX, e.clientY);
				if (sel && rng) {
					sel.setBaseAndExtent(rng.startContainer, rng.startOffset, rng.startContainer, rng.startOffset);
				}
			}

			[].forEach.call(e.dataTransfer.files, file => {
				this.quill.getModule('insert').insert(file);
			});

		}

	}

}
