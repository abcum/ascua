import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';

class Task {

	@tracked data = null;
	@tracked error = null;
	@tracked isLoading = true;
	@tracked isSuccess = false;
	@tracked isFailure = false;

	get isError() {
		return Boolean(this.error);
	}

}

export default class extends Component {

	get fastboot() {
		return getOwner(this).lookup('service:fastboot');
	}

	get waiter() {
		return Promise.resolve(this.args.promise);
	}

	get data() {

		if (this.fastboot && this.fastboot.isFastBoot) {
			this.fastboot.deferRendering(this.waiter);
		}

		if (this.promise === this.waiter) {
			return this.task;
		}

		this.promise = this.waiter;

		this.task = new Task();

		this.promise.then(
			(value) => {
				this.task.data = value;
				this.task.isLoading = false;
				this.task.isSuccess = true;
				this.task.isFailure = false;
			},
			(error) => {
				this.task.error = error;
				this.task.isLoading = false;
				this.task.isSuccess = false;
				this.task.isFailure = true;
				throw error;
			}
		);

		return this.task;

	}

}
