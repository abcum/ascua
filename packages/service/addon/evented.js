import Service from '@ember/service';

export default class Evented extends Service {

	events = {};

	on(e, ctx, func) {
		if (func === undefined) {
			func = ctx;
		}
		if (typeof this.events[e] !== 'object') {
			this.events[e] = [];
		}
		if (func instanceof Function) {
			this.events[e].push({ ctx, func });
		}
	}

	off(e, ctx, func) {
		if (typeof this.events[e] === 'object') {
			// Remove only the listener matching both ctx and func - keep an
			// entry unless it matches on both, i.e. `||`, not `&&`. The
			// inverted form here dropped any other listener sharing just the
			// ctx (e.g. the same route instance's other subscriptions) or
			// just the func, rather than only the one actually being
			// unsubscribed.
			this.events[e] = this.events[e].filter(v => {
				return v.ctx !== ctx || v.func !== func;
			});
		}
	}

	once(e, ctx, func) {
		this.on(e, function f(...args) {
			this.off(e, ctx, f);
			func.apply(ctx, args);
		});
	}

	emit(e, ...args) {
		if (typeof this.events[e] === 'object') {
			this.events[e].forEach(val => {
				val.func.apply(val.ctx, args);
			});
		}
	}

	removeAllListeners(e) {
		if (e) {
			if (typeof this.events[e] === 'object') {
				this.events[e] = [];
			}
		} else {
			for (const e in this.events) {
				this.events[e] = [];
			}
		}
	}

}
