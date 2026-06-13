export default (v) => {
	switch (v) {
	case undefined:
		return null;
	case null:
		return null;
	default:
		// Accept ISO strings, native Date objects, and the SDK's
		// `DateTime` instances (which stringify to an ISO value),
		// normalising them all to a JSON ISO datetime string.
		return v instanceof Date ? v.toJSON() : new Date(String(v)).toJSON();
	}
}
