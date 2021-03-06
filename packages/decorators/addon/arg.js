export default function(target, key, desc) {
	return {
		configurable: true,
		enumerable: true,
		set: undefined,
		get() {
			switch (this.args[key]) {
			case undefined:
				return desc.initializer();
			default:
				return this.args[key];
			}
		},
	}
}
