import Component from '@glimmer/component';
import { setProperties } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Item from '../classes/item';

export default class extends Component {

	total = 0;

	model = [];

	items = [];

	conf = {
		@tracked h: 0, // view height
		@tracked a: [], // active selection
		@tracked k: this.args.colWidth ? 'g' : 'l',
		v: { @tracked c: 0, @tracked r: 0 }, // visible items
		e: { @tracked w: 0, @tracked h: 0 }, // view dimensions
		i: { @tracked w: 0, @tracked h: 0 }, // item dimensions
		s: { @tracked l: 0, @tracked t: 0 }, // scroll positions
	};

	@action exit() {
		if (this.model !== this.args.model) return false;
		if (this.total !== this.args.model.length) return false;
		return true;
	}

	@action didCreate(element) {
		if (this.exit()) return;
		setProperties(this, {
			model: this.args.model,
			total: this.args.model.length,
		});
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.conf.i.w = parseInt(this.args.colWidth);
		this.conf.i.h = parseInt(this.args.rowHeight);
		this.conf.a = [].concat(this.args.selection);
		this.setup(true);
	}

	@action didChange(element) {
		if (this.exit()) return;
		setProperties(this, {
			model: this.args.model,
			total: this.args.model.length,
		});
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.conf.i.w = parseInt(this.args.colWidth);
		this.conf.i.h = parseInt(this.args.rowHeight);
		this.conf.a = [].concat(this.args.selection);
		this.setup(true);
	}

	@action didSelect(element) {
		this.conf.a = [].concat(this.args.selection);
	}

	@action didResize(element) {
		this.conf.e.w = element.clientWidth;
		this.conf.e.h = element.clientHeight;
		this.setup(true);
	}

	@action didScroll(element) {
		this.conf.s.t = element.target.scrollTop;
		this.conf.s.l = element.target.scrollLeft;
		this.setup(false);
	}

	setup(force = false) {

		// Total items
		let colW = this.conf.i.w;
		let rowH = this.conf.i.h;

		// Total visible columns
		let cols = 1;
		cols = colW ? Math.floor(this.conf.e.w / colW) : cols;
		cols = colW ? Math.max(1, cols) : cols;
		this.conf.v.c = cols;

		// Total visible rows
		let rows = 1;
		rows = rowH ? Math.ceil(this.conf.e.h / rowH) + 1 : rows;
		rows = rowH ? Math.max(1, rows) : rows;
		this.conf.v.r = rows;

		// Total div scrollheight
		this.conf.h = Math.ceil(this.total / cols) * rowH;

		// Number of beginning item
		let brw = Math.floor( this.conf.s.t / rowH );

		// Number of finishing item
		let frw = Math.floor( brw + ( rows - 1 ) ) + 1;

		// Index of beginning item
		let bix = Math.min(this.total, brw * cols) || 0;

		// Index of finishing item
		let fix = Math.min(this.total, frw * cols) || 0;

		// Check if we have scrolled
		if (this.idx == bix && force === false) return;

		// Set current start index
		this.idx = bix;

		// Difference of ids
		let sub = fix - bix;

		// Difference of rows
		let dif = sub - this.items.length;

		// Remove any extra item placeholders
		if (dif < 0) {
			for ( let i = 0; i > dif; --i ) {
				this.items.popObject();
			}
		}

		// Add necessary item placeholders
		if (dif > 0) {
			for ( let i = 0; i < dif; i++ ) {
				this.items.pushObject( new Item() );
			}
		}

		// Array of ids for rows to be loaded
		let ids = Array(sub).fill().map( (v, k) => k + bix );

		// Change placeholder content
		ids.forEach(i => {
			try {
				let pos = i % sub;
				let obj = this.items.objectAt(pos);
				obj.index = i;
				obj.model = this.args.model.objectAt(i, false);
				if (i === this.total - 1) {
					if (typeof this.args.model.loadmore === 'function') {
						this.args.model.loadmore(this.total);
					}
				}
			} catch (e) {
				// ignore
			}
		});

		// Cancel all remote fetches
		clearTimeout(this.timer);

		// Fetch and change placeholder content
		this.timer = setTimeout( () => {

			ids.forEach(i => {
				try {
					let pos = i % sub;
					let obj = this.items.objectAt(pos);
					obj.index = i;
					obj.model = this.args.model.objectAt(i, true);
					if (i === this.total - 1) {
						if (typeof this.args.model.loadmore === 'function') {
							this.args.model.loadmore(this.total);
						}
					}
				} catch (e) {
					// ignore
				}
			});

		}, 100);

	}

	@action select(item, options) {

		if (item && options.toggle) {
			if (this.conf.a.includes(item.id)) {
				this.conf.a.removeObject(item.id);
			} else {
				this.conf.a.addObject(item.id);
			}
		}

		if (item && options.range) {
			let min = Math.min(item.index, this.cursor);
			let max = Math.max(item.index, this.cursor);
			for (let i=min; i<=max; i++) {
				this.args.model.objectAt(i, true).then(item => {
					// An Item resolves to its content, so this `item` shadows the
					// outer one with the raw model — its id is not normalised by
					// Item#id and has to be stringified here.
					this.conf.a.addObject(String(item.id));
					if (this.args.onSelect) {
						this.args.onSelect(this.conf.a);
					}
				});
			}
		}

		if (item && options.single) {
			this.conf.a.clear();
			this.conf.a.addObject(item.id);
		}

		if (item === undefined) {
			this.conf.a.clear();
		}

		this.cursor = item ? item.index : null;

		if (this.args.onSelect) {
			this.args.onSelect(this.conf.a);
		}

	}

	@action didClick(event, item) {

		event.stopPropagation();

		if (event.shiftKey) {
			this.select(item, { range: true });
		}

		if (event.metaKey || event.altKey) {
			this.select(item, { toggle: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			this.select(item, { single: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			if (this.args.onClick) {
				if (item.model.content) {
					return this.args.onClick(item.model.content);
				} else {
					return this.args.onClick(item.model);
				}
			}
		}

	}

	@action dblClick(event, item) {

		event.stopPropagation();

		if (event.shiftKey) {
			this.select(item, { range: true });
		}

		if (event.metaKey || event.altKey) {
			this.select(item, { toggle: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			this.select(item, { single: true });
		}

		if (!event.metaKey && !event.altKey && !event.shiftKey) {
			if (this.args.onDblClick) {
				if (item.model.content) {
					return this.args.onDblClick(item.model.content);
				} else {
					return this.args.onDblClick(item.model);
				}
			}
		}

	}

	@action ctxClick(event, item) {

		this.select(item, { single: true });

		if (this.args.onContextMenu) {
			if (item.model.content) {
				return this.args.onContextMenu(event, item.model.content);
			} else {
				return this.args.onContextMenu(event, item.model);
			}
		}

	}

}
