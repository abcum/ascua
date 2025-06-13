import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { timeout } from '@ascua/tasks';
import { restart } from '@ascua/tasks';

export default class extends Component {

	@service pdfjs;

	@tracked doc;

	@tracked element;

	@tracked pages = [];

	@tracked renders = {};

	@tracked page = this.args.page || 1;

	@action didCreate(element) {
		this.element = element;
		this.process.run(this.args.url);
	}

	@action didChange(element) {
		this.element = element;
		this.process.run(this.args.url);
	}

	@action willDelete() {
		this.cleanup.run();
		this.destroy.run();
	}

	@action prev() {
		if (this.element) {
			if (this.page > 1) {
				if (this.element.contains(document.activeElement)) {
					this.page--;
					if (this.args.onSelectPage) {
						this.args.onSelectPage(this.page);
					}
				}
			}
		}
	}

	@action next() {
		if (this.element) {
			if (this.page < this.pages.length) {
				if (this.element.contains(document.activeElement)) {
					this.page++;
					if (this.args.onSelectPage) {
						this.args.onSelectPage(this.page);
					}
				}
			}
		}
	}

	@action select(page) {
		if (page != this.page) {
			this.page = page;
			if (this.args.onSelectPage) {
				this.args.onSelectPage(page);
			}
		}
	}

	@restart * cleanup() {
		try {
			for (let page of this.pages) { yield page.cleanup(); }
			if (this.doc && this.doc.cleanup) yield this.doc.cleanup();
			if (this.doc && this.doc.destroy) yield this.doc.destroy();
			if (this.xhr && this.xhr.destroy) yield this.xhr.destroy();
		} catch (e) {
			// Ignore
		}
	}

	@restart * destroy() {
		try {
			if (this.wkr && this.wkr.destroy) yield this.wkr.destroy();
		} catch (e) {
			// Ignore
		}
	}

	@restart * process(url) {

		try {

			let pages = [];

			yield timeout(100);

			yield this.cleanup.run();

			this.lib = yield this.pdfjs.load();
			this.wkr = this.wkr || new this.lib.PDFWorker('worker');
			this.xhr = this.lib.getDocument({
				url: url,
				worker: this.wkr,
				isEvalSupported: false,
			});
			this.doc = yield this.xhr.promise;

			for (let i = 1; i <= this.doc.numPages; i++) {
				pages.pushObject(this.doc.getPage(i));
			}

			this.pages = yield Promise.all(pages);

		} catch (e) {

			// Ignore

		}

	}

}
