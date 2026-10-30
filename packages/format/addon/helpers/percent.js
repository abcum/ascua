import localised from '../utils/localised';
import { formatNumber } from '@ascua/intl/utils/message';

export function percent(params, hash = { style: 'percent' }, locale = 'en') {
	let options = Object.assign({}, hash);
	options.style = 'percent';
	return formatNumber(Number(params[0]), locale, options);
}

export default localised(percent);
