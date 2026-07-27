import Component from '@glimmer/component';
import { action } from '@ember/object';
import Chart from 'apexcharts.js';

export default class extends Component {

	get width() {
		return this.args.width || '100%';
	}

	get height() {
		return this.args.height || '100%';
	}

	// ApexCharts iterates `series` with forEach on both create and update, so an
	// absent @data takes the whole app down with "Cannot read properties of
	// undefined (reading 'forEach')" rather than drawing nothing. @data is
	// routinely absent for a tick — it usually arrives from a task, and any
	// caller whose template guard names a different property than the one it
	// passes will render before the data lands. An empty series is the honest
	// representation of "no data yet"; a thrown error is not.

	get series() {
		return this.args.data ?? [];
	}

	get initial() {
		let data = { series: this.series };
		return Object.assign({}, data, this.args.opts);
	}

	@action didCreate(element) {
		if (Chart) {
			this.chart = new Chart(element, this.initial);
			this.chart.render();
		}
	}

	@action didChange() {
		// didChange can fire before didCreate has run, or after willDelete has
		// destroyed the chart, and updateOptions on a missing chart throws the
		// same way.
		if (Chart && this.chart) {
			if (this.args.opts) this.chart.updateOptions(this.args.opts);
			this.chart.updateSeries(this.series);
		}
	}

	@action willDelete() {
		if (Chart && this.chart) {
			this.chart.destroy();
			this.chart = undefined;
		}
	}

}
