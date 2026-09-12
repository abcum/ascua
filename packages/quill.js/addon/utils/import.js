export default class Import {

	constructor(quill, options) {

		this.quill = quill;
		this.allowMedia = options?.allowMedia !== false;

		this.quill.root.addEventListener('drop', this.didDrop, false);
		this.quill.root.addEventListener('paste', this.didPaste, false);
		this.quill.getModule('toolbar').addHandler('image', this.didImage);
		this.quill.getModule('toolbar').addHandler('video', this.didVideo);

	}

	didImage(e) {

		if (!this.allowMedia) return;

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

		if (!this.allowMedia) return;

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

	didPaste = (e) => {

		if (e.clipboardData?.files?.length) {
			e.preventDefault();
			e.stopImmediatePropagation();
			if (!this.allowMedia) return;
			[].forEach.call(e.clipboardData.files, file => {
				this.quill.getModule('insert').insert(file);
			});
		}

	}

	didDrop = (e) => {

		e.preventDefault();
		e.stopImmediatePropagation();

		if (e.dataTransfer?.files?.length) {

			if (!this.allowMedia) return;

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
