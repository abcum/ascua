import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const CANCELLED = new Error("Cancelled task instance");

export default class Task {

	#typ = 'task';

	#ctx = undefined;

	#fnc = undefined;

	tasks = [];

	@tracked value;

	@tracked error;

	@tracked isIdle = true;

	@tracked isRunning = false;

	@tracked isFailure = false;

	@tracked isSuccess = false;

	constructor(ctx, fnc, typ = 'task') {

		this.#ctx = ctx;

		this.#fnc = fnc;

		this.#typ = typ;

	}

	@action async run() {

		switch (this.#typ) {
		case 'task':
			break;
		case 'drop':
			if (this.tasks.length) {
				return;
			}
			break;
		case 'restart':
			if (this.tasks.length) {
				try {
					let task = this.tasks[this.tasks.length-1];
					this.tasks.removeObject(task);
					task.error = CANCELLED;
					task.throw(CANCELLED);
				} catch (e) {
					// Ignore
				}
			}
			break;
		}

		let task = this.#fnc.call(this.#ctx, ...arguments);

		try {

			let res = undefined;
			let val = undefined;

			// Add the task to the list

			this.tasks.pushObject(task);

			// Set the task to running

			this.isIdle = false;
			this.isRunning = true;
			this.isSuccess = false;
			this.isFailure = false;

			// Execute the task steps

			while (true) {
				res = task.next(val);
				val = await res.value;
				if (res.done) break;
			}

			// Set the value on the task

			task.value = val;

		} catch (err) {

			// Set the error on the task

			task.error = err;

			// Throw the error upwards

			try {
				task.throw(err);
			} catch (err) {
				task.error = err;
			}

		} finally {

			// Remove the task from the list

			this.tasks.removeObject(task);

			// Set the task to idle

			if (task.error === CANCELLED) {
				if (!this.isDestroyed) {
					if (!this.isDestroying) {
						this.isIdle = (this.tasks.length === 0);
						this.isRunning = (this.tasks.length !== 0);
					}
				}
			}

			if (task.error !== CANCELLED) {
				if (!this.isDestroyed) {
					if (!this.isDestroying) {

						// `task.value` is only ever assigned on the successful
						// path, so a failed run carries `undefined` — copying it
						// out unconditionally wiped the last good value. A task
						// that had succeeded and then failed reported no value
						// and no result, which reads as "never ran" rather than
						// "ran, and this time it broke".
						//
						// The failure is still reported: `error` and
						// `isFailure` are set either way, and a caller that must
						// distinguish stale from fresh has `isSuccess` for it.

						if (task.error === undefined) {
							this.value = task.value;
						}

						this.error = task.error;
						this.isIdle = (this.tasks.length === 0);
						this.isRunning = (this.tasks.length !== 0);
						this.isSuccess = (task.error === undefined);
						this.isFailure = (task.error !== undefined);
					}
				}
			}

			if (task.error !== CANCELLED) {
				if (task.error) {
					throw task.error;
				}
			}

		}

	}

	@action cancel() {
		for (const task of this.tasks) {
			try {
				task.throw(CANCELLED);
			} catch (e) {
				// Ignore
			}
		}
	}

	@action reset() {
		this.isIdle = true;
		this.isRunning = false;
		this.isSuccess = false;
		this.isFailure = false;
	}

}
