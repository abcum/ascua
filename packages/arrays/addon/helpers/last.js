import { helper } from '@ember/component/helper';
import array from '../utils/array';

// Same note as `first.js`: a plain native array, so a direct index.

export function last([value]) {
	let a = array(value);
	return a[a.length - 1];
}

export default helper(last);
