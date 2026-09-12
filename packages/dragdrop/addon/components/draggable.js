import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class extends Component {

	@tracked dragging = false;

	@action didDragEnd(event) {
		this.stopRecovery();
		this.dragging = false;
		event.stopPropagation();
	}

	@action didDragStart(event) {
		this.dragging = true;
		this.startRecovery();
		event.stopPropagation();
		if (this.args.onDrag) {
			this.args.onDrag(event);
		}
	}

	// Native drag-and-drop guarantees a dragend once a real drag session
	// ends, but something else can grab the pointer sequence first - a
	// context menu opening mid-drag, most commonly - and dragend never
	// arrives, leaving `dragging` stuck true forever with nothing able
	// to clear it (droppable.js's `dropping` flag has a timeout fallback
	// for exactly this kind of gap; this flag had none at all).
	//
	// These listeners are only attached while THIS item is being
	// dragged, and force `dragging` back to false the moment any of them
	// fires - contextmenu is caught in the capture phase so it runs
	// before a right-click handler further down the tree (e.g.
	// @ascua/contextmenu's RightClick) can stop the event propagating.

	@action recover() {
		this.stopRecovery();
		this.dragging = false;
	}

	@action recoverOnEscape(event) {
		if (event.key === 'Escape') this.recover();
	}

	startRecovery() {
		document.addEventListener('contextmenu', this.recover, true);
		document.addEventListener('mouseup', this.recover);
		document.addEventListener('keydown', this.recoverOnEscape);
	}

	stopRecovery() {
		document.removeEventListener('contextmenu', this.recover, true);
		document.removeEventListener('mouseup', this.recover);
		document.removeEventListener('keydown', this.recoverOnEscape);
	}

	willDestroy() {
		this.stopRecovery();
		super.willDestroy(...arguments);
	}

}
