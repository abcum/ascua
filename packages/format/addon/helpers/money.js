import localised from '../utils/localised';
import { formatNumber } from '@ascua/intl/utils/message';

export function money(params, hash = { style: 'currency', currency: 'USD' }, locale = 'en') {
	let options = Object.assign({}, hash);
	options.style = 'currency';
	options.currency = options.currency || 'USD';
	options.minimumFractionDigits = options.minimumFractionDigits ?? 0;
	options.maximumFractionDigits = options.maximumFractionDigits ?? 0;
	return formatNumber(Number(params[0]), locale, options);
}

export default localised(money);
