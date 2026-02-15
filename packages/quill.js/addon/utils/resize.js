const props = [
	'userSelect',
	'mozUserSelect',
	'webkitUserSelect',
	'msUserSelect',
];

const edges = [
	'nwse-resize',
	'nesw-resize',
	'nwse-resize',
	'nesw-resize',
];

export default class Resize {

	boxes = [];

	img = undefined; // The selected image

	box = undefined; // Currently dragging box

	sizer = undefined; // The dimensions element

	witdh = undefined; // Start width when dragging

	start = undefined; // Start position when dragging

	constructor(quill) {

		this.quill = quill;

		this.didKeyup = this.didKeyup.bind(this);
		this.didClick = this.didClick.bind(this);
		this.didMouseup = this.didMouseup.bind(this);
		this.didMousedown = this.didMousedown.bind(this);
		this.didMousemove = this.didMousemove.bind(this);

		document.execCommand('enableObjectResizing', false, 'false');

		this.quill.root.addEventListener('click', this.didClick, false);

	}

	show(img) {
		this.img = img;
		this.showSizer();
		this.showBoxes();
		this.positioning();
		this.preventSelect();
	}

	hide() {
		this.hideSizer();
		this.hideBoxes();
		this.allowSelect();
		this.img = undefined;
	}

	positioning() {
		const rect = {
			width: this.img.width,
			height: this.img.height,
			left: this.img.offsetLeft,
			top: this.img.offsetTop,
		};
		this.positionBoxes(rect);
		this.positionSizer(rect);
	}

	// Methods for preventing text
	// selection while dragging an
	// image resize handle.

	allowSelect() {
		for (const prop of props) {
			this.quill.root.style[prop] = 'auto';
			document.documentElement.style[prop] = 'auto';
		}
	}

	preventSelect() {
		for (const prop of props) {
			this.quill.root.style[prop] = 'none';
			document.documentElement.style[prop] = 'none';
		}
	}

	// Methods for showing, hiding,
	// and positioning the element
	// which display the image size.

	showSizer() {
		this.sizer = document.createElement('div');
		this.sizer.classList.add('ql-dimensions');
		this.quill.root.parentNode.appendChild(this.sizer);
	}

	hideSizer() {
		this.quill.root.parentNode.removeChild(this.sizer);
		this.sizer = undefined;
	}

	positionSizer(rect) {

		if (!this.img || !this.sizer) return;

		const size = [
			this.img.width,
			Math.round(this.img.width / this.img.naturalWidth * this.img.naturalHeight),
		];

		this.sizer.innerHTML = size.join(' &times; ');

		if (size[0] > 120 && size[1] > 30) {
			const area = this.sizer.getBoundingClientRect();
			this.sizer.style.left = Math.round(rect.left + rect.width - area.width - 8) + 'px';
			this.sizer.style.top = Math.round(rect.top + rect.height - area.height - 8) + 'px';
		} else {
			this.sizer.style.left = Math.round(rect.left + rect.width + 8) + 'px';
			this.sizer.style.top = Math.round(rect.top + rect.height + 8) + 'px';
		}

	}

	// Methods for showing, hiding,
	// and positioning the elements
	// for resizing the image.

	showBoxes() {
		for (let i = 0; i < edges.length; i++) {
			this.boxes[i] = document.createElement('div');
			this.boxes[i].classList.add('ql-resizehandle');
			this.boxes[i].classList.add(edges[i]);
			this.boxes[i].addEventListener('mousedown', this.didMousedown, false);
			this.quill.root.parentNode.appendChild(this.boxes[i]);
		}
		document.addEventListener('keyup', this.didKeyup, true);
		this.quill.root.addEventListener('input', this.didKeyup, true);
	}

	hideBoxes() {
		document.removeEventListener('keyup', this.didKeyup);
		this.quill.root.removeEventListener('input', this.didKeyup);
		this.boxes.forEach(e => this.quill.root.parentNode.removeChild(e));
		this.boxes = [];
	}

	positionBoxes(rect) {

		if (!this.img || !this.sizer) return;

		const handleSize = 12; // Size of the resize handle in pixels
		const offset = handleSize / 2; // Center the handle on the edge

		let positions = [
			{ left: rect.left - offset, top: rect.top - offset },
			{ left: rect.left + rect.width - offset, top: rect.top - offset },
			{ left: rect.left + rect.width - offset, top: rect.top + rect.height - offset },
			{ left: rect.left - offset, top: rect.top + rect.height - offset },

		];

		positions.forEach((pos, idx) => {
			this.boxes[idx].style.top = Math.round(pos.top) + 'px';
			this.boxes[idx].style.left = Math.round(pos.left) + 'px';
		});

	}

	// Methods for handling events
	// which will allow selecting
	// and resizing images in Quill.

	didKeyup() {
		if (this.img) this.hide();
	}

	didClick(e) {
		if (e.target && e.target.tagName && e.target.tagName.toUpperCase() === 'IMG') {
			if (this.img === e.target) return; // Image is already focused
			if (this.img) this.hide(); // Other iamge was clicked
			this.show(e.target);
		} else if (this.img) {
			this.hide();
		}
	}

	didMouseup() {
		this.box = undefined;
		this.start = undefined;
		this.width = undefined;
		document.removeEventListener('mouseup', this.didMouseup);
		document.removeEventListener('mousemove', this.didMousemove);
	}

	didMousedown(e) {
		this.box = e.target;
		this.start = e.clientX;
		this.width = this.img.width || this.img.naturalWidth;
		document.addEventListener('mouseup', this.didMouseup, false);
		document.addEventListener('mousemove', this.didMousemove, false);
	}

	didMousemove(e) {

		if (!this.img) return;

		if (this.box === this.boxes[0] || this.box === this.boxes[3]) {
			this.img.width = Math.round(this.width - e.clientX + this.start);
		} else {
			this.img.width = Math.round(this.width + e.clientX - this.start);
		}

		this.positioning();

	}

}
