const func = (v) => v;

export default class RecordArray extends Array {

	static create(owner, type = func, ...values) {
		let v = values.map(type);
		let a = new this(...v);
		a.type = type;
		return new Proxy(a, {
			get() {
				return Reflect.get(...arguments);
			},
			set() {
				let val = Reflect.set(...arguments);
				if (owner) owner.autosave();
				return val;
			}
		});
	}

	type = func;

	// Each of these used to delegate to `super.X`, i.e. Ember's `MutableArray`
	// methods on `Array.prototype` — available only through
	// `EXTEND_PROTOTYPES.Array`, an application-level setting, deprecated and
	// removed in ember-source 6.0. Reimplemented here on plain array
	// operations instead; a host that turns the extension off does not lose
	// field arrays.
	//
	// Reactivity is unaffected either way: `create`'s `Proxy` above notifies
	// on the underlying index/length assignment these methods perform, not on
	// which named method performed it.

	addObject(value) {
		value = this.type(value);
		if (!this.includes(value)) this.push(value);
		return value;
	}

	addObjects(values) {
		for (const value of [].concat(values)) this.addObject(value);
		return this;
	}

	pushObject(value) {
		value = this.type(value);
		this.push(value);
		return value;
	}

	pushObjects(values) {
		this.push(...[].concat(values).map(this.type));
		return this;
	}

	setObjects(values) {
		this.length = 0;
		this.push(...[].concat(values).map(this.type));
		return this;
	}

	replace(idx, count, values) {
		this.splice(idx, count, ...[].concat(values).map(this.type));
		return this;
	}

	then() {
		return Promise.all(this).then(...arguments);
	}

	catch() {
		return Promise.all(this).catch(...arguments);
	}

	finally() {
		return Promise.all(this).finally(...arguments);
	}

}
