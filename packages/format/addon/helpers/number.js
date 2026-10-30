import localised from '../utils/localised';
import { formatNumber } from '@ascua/intl/utils/message';

export function number(params, hash = { style: 'decimal' }, locale = 'en') {
	let options = Object.assign({}, hash);
	options.style = 'decimal';
	return formatNumber(Number(params[0]), locale, options);
}

export default localised(number);
