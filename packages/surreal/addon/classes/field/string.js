import Property from './property';
import String from '../types/string';

export default Property({
	get(key) {
		return String(this.data[key]);
	},
	set(key, value) {
		return this.data[key] = String(value);
	},
});