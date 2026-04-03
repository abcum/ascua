import { helper } from '@ember/component/helper';

export function money(params, hash = { style: 'currency', currency: 'USD' }) {
	let options = Object.assign({}, hash);
	options.style = 'currency';
	options.currency = options.currency || 'USD';
	options.minimumFractionDigits = options.minimumFractionDigits ?? 0;
	options.maximumFractionDigits = options.maximumFractionDigits ?? 0;
	return Number(params[0]).toLocaleString([], options);
}

export default helper(money);
