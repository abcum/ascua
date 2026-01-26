import Service from '@ascua/service/evented';
import Quill from 'quill';

const Delta = Quill.import('delta');

export default class extends Service {

	#instances = [];

	willDestroy() {
		this.removeAllListeners();
		super.willDestroy(...arguments);
	}

	register(component) {
		this.#instances.addObject(component);
	}

	unregister(component) {
		this.#instances.removeObject(component);
	}

	text(name, instance, text, source = 'api') {

		// Ensure the object is a proper Delta instance.
		let delta = new Delta().insert(text);

		// Ensure all other editors are updated with the changes.
		this.#instances.filterBy('name', name).forEach(q => {
			if (q.instance !== instance) {
				q.instance.setContents(delta, 'silent');
			}
		});

		// Trigger a 'insert' notification so others can subscribe.
		this.emit('insert', name, instance, delta, source);

	}

	html(name, instance, html, source = 'api') {

		let delta = this.#instances[0].instance.clipboard.convert({ html });

		// Ensure all other editors are updated with the changes.
		this.#instances.filterBy('name', name).forEach(q => {
			if (q.instance !== instance) {
				q.instance.setContents(delta, 'silent');
			}
		});

		// Trigger a 'insert' notification so others can subscribe.
		this.emit('insert', name, instance, delta, source);

	}

	insert(name, instance, delta, source = 'api') {

		// Ensure the object is a proper Delta instance.
		delta = delta instanceof Delta ? delta : new Delta(delta);

		// Ensure all other editors are updated with the changes.
		this.#instances.filterBy('name', name).forEach(q => {
			if (q.instance !== instance) {
				q.instance.setContents(delta, 'silent');
			}
		});

		// Trigger a 'insert' notification so others can subscribe.
		this.emit('insert', name, instance, delta, source);

	}

	update(name, instance, delta, from, source = 'api') {

		// Ensure the object is a proper Delta instance.
		delta = delta instanceof Delta ? delta : new Delta(delta);

		// Ensure all other editors are updated with the changes.
		this.#instances.filterBy('name', name).forEach(q => {
			if (q.instance !== instance) {
				q.instance.updateContents(delta, 'silent');
			}
		});

		// Trigger a 'update' notification so others can subscribe.
		this.emit('update', name, instance, delta, from, source);

	}

	select(name, instance, delta, from, source = 'api') {

		// Ensure the object is a proper Delta instance.
		delta = delta instanceof Delta ? delta : new Delta(delta);

		// Trigger a 'select' notification so others can subscribe.
		this.emit('select', name, instance, delta, from, source);

	}

}
