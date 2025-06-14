const insert = async function (file) {
	return new Promise(resolve => {
		const rdr = new FileReader();
		rdr.onload = (e) => {
			resolve(e.target.result);
		};
		rdr.readAsDataURL(file);
	});
}

export default class Insert {

	constructor(quill, options) {

		this.quill = quill;
		this.handler = options;

	}

	async insert(file) {

		if (file.type.match(/^image\/(gif|jpg|jpeg|png|apng|svg|webp|bmp)$/i)) {

			if (typeof this.handler === 'function') {
				const src = await this.handler(file);
				const idx = (this.quill.getSelection() || {}).index;
				if (idx < 0) idx = this.quill.getLength();
				this.quill.insertEmbed(idx, 'image', src, 'user');
			} else {
				const src = await insert(file);
				const idx = (this.quill.getSelection() || {}).index;
				if (idx < 0) idx = this.quill.getLength();
				this.quill.insertEmbed(idx, 'image', src, 'user');
			}

		}

		if (file.type.match(/^video\//i)) {

			if (typeof this.handler === 'function') {
				const src = await this.handler(file);
				const idx = (this.quill.getSelection() || {}).index;
				if (idx < 0) idx = this.quill.getLength();
				this.quill.insertEmbed(idx, 'video', src, 'user');
			} else {
				const src = await insert(file);
				const idx = (this.quill.getSelection() || {}).index;
				if (idx < 0) idx = this.quill.getLength();
				this.quill.insertEmbed(idx, 'video', src, 'user');
			}

		}

	}

}
