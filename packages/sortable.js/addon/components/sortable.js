import Component from '@glimmer/component';
import { action } from '@ember/object';
import { arg } from '@ascua/decorators';
import Sortable from 'sortable';

// With forceFallback (used throughout this app for its kanban boards),
// SortableJS simulates the whole drag itself and only ends it via its own
// mouseup/pointerup/touchend listeners on `document` - there's no native
// drag session for the browser to fall back on. If something else grabs
// the pointer sequence first - a context menu opening mid-drag, most
// commonly - that listener never sees a mouseup, and the drag is stuck
// forever: the source card stays under `sortable-ghost` and nothing can
// drop or escape it, since nothing else in this addon or the app ever
// resolves it either.
//
// These two listeners are a page-wide recovery net, installed once
// regardless of how many <Ascua::Sortable> instances exist, that end
// whatever drag is active (`Sortable.active`, a documented static
// property) by dispatching the same events SortableJS itself listens
// for to end a drag, rather than reaching into its private internals -
// contextmenu is caught in the capture phase so it runs before a
// right-click handler further down the tree (e.g. @ascua/contextmenu's
// RightClick) can stop the event propagating.

let recoveryInstalled = false;

function endActiveDrag() {
	if (Sortable.active) {
		// Which of these SortableJS is actually listening for depends on
		// supportPointer (true whenever the browser has PointerEvent and
		// isn't Safari) - dispatching both covers either configuration.
		document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
		document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
	}
}

function installDragRecovery() {
	if (recoveryInstalled) return;
	recoveryInstalled = true;
	document.addEventListener('contextmenu', endActiveDrag, true);
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') endActiveDrag();
	});
}

export default class extends Component {

	@arg options = {};

	#events = [
		'onChoose',
		'onUnchoose',
		'onStart',
		'onEnd',
		'onAdd',
		'onUpdate',
		'onSort',
		'onRemove',
		'onMove',
		'onClone',
		'onChange',
		'scrollFn',
		'setData',
		'onFilter',
	];

	@action didCreate(element) {

		if (!Sortable) return;

		installDragRecovery();

		this.instance = Sortable.create(element, {
			...this.options
		});

		this.#events.forEach(name => {
			const fn = this.args.options[name];
			if (typeof fn === 'function') {
				this.instance.option(name, (...args) => {
					fn(this.instance, ...args);
				});
			}
		});

	}

	@action didChange(element) {

		if (!Sortable) return;

		let opts = Object.entries(this.options);

		for (let [key, val] of opts) {
			if (this.#events.includes(key) && typeof val === 'function') {
				this.instance.option(key, (...args) => {
					val(this.instance, ...args);
				});
			} else {
				this.instance.option(key, val);
			}
		}

	}

	@action willDelete() {

		if (!Sortable) return;

		this.instance.destroy();

	}

}
